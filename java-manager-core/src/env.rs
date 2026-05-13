use crate::errors::{JdkManagerError, Result};

// ── Windows implementation ────────────────────────────────────────────────────

#[cfg(windows)]
mod platform {
    use super::*;
    use winreg::{enums::*, RegKey, RegValue};

    fn user_env_key(write: bool) -> Result<RegKey> {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        if write {
            hkcu.open_subkey_with_flags("Environment", KEY_READ | KEY_WRITE)
        } else {
            hkcu.open_subkey("Environment")
        }
        .map_err(|e| JdkManagerError::Registry(format!("Cannot open HKCU\\Environment: {e}")))
    }

    pub fn get_java_home() -> Option<String> {
        let key = user_env_key(false).ok()?;
        key.get_value("JAVA_HOME").ok()
    }

    pub fn set_java_home(path: &str) -> Result<()> {
        let key = user_env_key(true)?;
        key.set_value("JAVA_HOME", &path.to_string())
            .map_err(|e| JdkManagerError::Registry(format!("Cannot write JAVA_HOME: {e}")))?;
        Ok(())
    }

    pub fn get_user_path() -> Result<String> {
        let key = user_env_key(false)?;
        // Path key name is case-insensitive in registry but commonly "Path"
        let val: String = key
            .get_value("Path")
            .or_else(|_| key.get_value("PATH"))
            .unwrap_or_default();
        Ok(val)
    }

    /// Write PATH back to the registry, preserving REG_EXPAND_SZ vs REG_SZ.
    fn write_user_path(path: &str) -> Result<()> {
        let key = user_env_key(true)?;

        // Detect existing value type so we don't downgrade REG_EXPAND_SZ -> REG_SZ
        let vtype = key
            .get_raw_value("Path")
            .map(|rv| rv.vtype)
            .unwrap_or(REG_EXPAND_SZ);

        let wide_bytes: Vec<u8> = path
            .encode_utf16()
            .chain(std::iter::once(0u16))
            .flat_map(|c| c.to_le_bytes())
            .collect();

        key.set_raw_value("Path", &RegValue { bytes: wide_bytes, vtype })
            .map_err(|e| JdkManagerError::Registry(format!("Cannot write Path: {e}")))?;
        Ok(())
    }

    /// Remove all `managed_bins` from the user PATH, then prepend `new_java_bin`.
    pub fn patch_user_path(new_java_bin: &str, managed_bins: &[String]) -> Result<()> {
        let current = get_user_path()?;
        let new_lower = new_java_bin.to_lowercase();
        let managed_lower: Vec<String> = managed_bins.iter().map(|s| s.to_lowercase()).collect();

        let mut parts: Vec<&str> = current
            .split(';')
            .map(str::trim)
            .filter(|s| {
                if s.is_empty() {
                    return false;
                }
                let lower = s.to_lowercase();
                // Drop any previously-managed java bins and the new one (added fresh below)
                !managed_lower.iter().any(|m| *m == lower) && lower != new_lower
            })
            .collect();

        // Prepend new bin so it wins over any system-wide Java entry
        let mut new_parts = vec![new_java_bin];
        new_parts.extend(parts.drain(..));
        let new_path = new_parts.join(";");

        write_user_path(&new_path)?;
        Ok(())
    }

    const SYSTEM_ENV_PATH: &str =
        r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment";

    fn system_env_key(write: bool) -> Result<RegKey> {
        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        let access = if write {
            KEY_READ | KEY_WRITE
        } else {
            KEY_READ
        };
        hklm.open_subkey_with_flags(SYSTEM_ENV_PATH, access)
            .map_err(|e| {
                JdkManagerError::Registry(format!(
                    "Cannot open HKLM system environment (run as administrator?): {e}"
                ))
            })
    }

    pub fn set_system_java_home(path: &str) -> Result<()> {
        let key = system_env_key(true)?;
        key.set_value("JAVA_HOME", &path.to_string())
            .map_err(|e| JdkManagerError::Registry(format!("Cannot write system JAVA_HOME: {e}")))?;
        Ok(())
    }

    pub fn get_system_path() -> Result<String> {
        let key = system_env_key(false)?;
        let val: String = key
            .get_value("Path")
            .or_else(|_| key.get_value("PATH"))
            .unwrap_or_default();
        Ok(val)
    }

    fn write_system_path(path: &str) -> Result<()> {
        let key = system_env_key(true)?;

        let vtype = key
            .get_raw_value("Path")
            .map(|rv| rv.vtype)
            .unwrap_or(REG_EXPAND_SZ);

        let wide_bytes: Vec<u8> = path
            .encode_utf16()
            .chain(std::iter::once(0u16))
            .flat_map(|c| c.to_le_bytes())
            .collect();

        key.set_raw_value("Path", &RegValue { bytes: wide_bytes, vtype })
            .map_err(|e| JdkManagerError::Registry(format!("Cannot write system Path: {e}")))?;
        Ok(())
    }

    /// Remove all `managed_bins` from the system PATH, then prepend `new_java_bin`.
    pub fn patch_system_path(new_java_bin: &str, managed_bins: &[String]) -> Result<()> {
        let current = get_system_path()?;
        let new_lower = new_java_bin.to_lowercase();
        let managed_lower: Vec<String> = managed_bins.iter().map(|s| s.to_lowercase()).collect();

        let mut parts: Vec<&str> = current
            .split(';')
            .map(str::trim)
            .filter(|s| {
                if s.is_empty() {
                    return false;
                }
                let lower = s.to_lowercase();
                !managed_lower.iter().any(|m| *m == lower) && lower != new_lower
            })
            .collect();

        let mut new_parts = vec![new_java_bin];
        new_parts.extend(parts.drain(..));
        write_system_path(&new_parts.join(";"))?;
        Ok(())
    }

    pub fn broadcast_env_change() -> Result<()> {
        use std::os::windows::ffi::OsStrExt;
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            SendMessageTimeoutW, SMTO_ABORTIFHUNG, WM_SETTINGCHANGE,
        };

        let env: Vec<u16> = std::ffi::OsStr::new("Environment")
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        unsafe {
            let mut result: usize = 0;
            SendMessageTimeoutW(
                0xFFFF_isize, // HWND_BROADCAST
                WM_SETTINGCHANGE,
                0,
                env.as_ptr() as isize,
                SMTO_ABORTIFHUNG,
                5000,
                &mut result,
            );
        }
        Ok(())
    }

    pub fn is_elevated() -> bool {
        use windows_sys::Win32::Foundation::BOOL;
        use windows_sys::Win32::Security::{
            AllocateAndInitializeSid, CheckTokenMembership, FreeSid, SID_IDENTIFIER_AUTHORITY,
        };
        const SECURITY_BUILTIN_DOMAIN_RID: u32 = 0x0000_0020;
        const DOMAIN_ALIAS_RID_ADMINS: u32 = 0x0000_0220;

        unsafe {
            let mut nt_authority = SID_IDENTIFIER_AUTHORITY {
                Value: [0, 0, 0, 0, 0, 5],
            };
            let mut admin_group = std::ptr::null_mut();

            let sid_ok = AllocateAndInitializeSid(
                &mut nt_authority,
                2,
                SECURITY_BUILTIN_DOMAIN_RID,
                DOMAIN_ALIAS_RID_ADMINS,
                0,
                0,
                0,
                0,
                0,
                0,
                &mut admin_group,
            );

            if sid_ok == 0 || admin_group.is_null() {
                return false;
            }

            let mut is_member: BOOL = 0;
            let membership_ok = CheckTokenMembership(0, admin_group, &mut is_member);
            FreeSid(admin_group);

            membership_ok != 0 && is_member != 0
        }
    }

    /// Scan the Windows registry for registered JDK installations.
    pub fn registry_jdk_homes() -> Vec<String> {
        let mut homes = Vec::new();
        let search_roots = [
            (HKEY_LOCAL_MACHINE, r"SOFTWARE\JavaSoft\JDK"),
            (HKEY_LOCAL_MACHINE, r"SOFTWARE\JavaSoft\Java Development Kit"),
            (HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\JavaSoft\JDK"),
            (
                HKEY_LOCAL_MACHINE,
                r"SOFTWARE\WOW6432Node\JavaSoft\Java Development Kit",
            ),
        ];

        for (hive, path) in &search_roots {
            let root = RegKey::predef(*hive);
            let Ok(key) = root.open_subkey(path) else {
                continue;
            };
            for ver in key.enum_keys().flatten() {
                let Ok(vkey) = key.open_subkey(&ver) else {
                    continue;
                };
                if let Ok(home) = vkey.get_value::<String, _>("JavaHome") {
                    if !home.is_empty() {
                        homes.push(home);
                    }
                }
            }
        }
        homes
    }
}

// ── Non-Windows stub ─────────────────────────────────────────────────────────

#[cfg(not(windows))]
mod platform {
    use super::*;

    pub fn get_java_home() -> Option<String> {
        std::env::var("JAVA_HOME").ok()
    }
    pub fn set_java_home(_path: &str) -> Result<()> {
        Err(JdkManagerError::Other(
            "Windows-only: cannot set JAVA_HOME on this platform".into(),
        ))
    }
    pub fn get_user_path() -> Result<String> {
        Ok(std::env::var("PATH").unwrap_or_default())
    }
    pub fn patch_user_path(_new: &str, _old: &[String]) -> Result<()> {
        Err(JdkManagerError::Other(
            "Windows-only: cannot patch PATH on this platform".into(),
        ))
    }
    pub fn set_system_java_home(_path: &str) -> Result<()> {
        Err(JdkManagerError::Other(
            "Windows-only: cannot set system JAVA_HOME on this platform".into(),
        ))
    }
    pub fn get_system_path() -> Result<String> {
        Ok(std::env::var("PATH").unwrap_or_default())
    }
    pub fn patch_system_path(_new: &str, _old: &[String]) -> Result<()> {
        Err(JdkManagerError::Other(
            "Windows-only: cannot patch system PATH on this platform".into(),
        ))
    }
    pub fn broadcast_env_change() -> Result<()> {
        Ok(())
    }
    pub fn is_elevated() -> bool {
        false
    }
    pub fn registry_jdk_homes() -> Vec<String> {
        Vec::new()
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

pub fn get_java_home() -> Option<String> {
    platform::get_java_home()
}

pub fn set_java_home(path: &str) -> Result<()> {
    platform::set_java_home(path)
}

pub fn get_user_path() -> Result<String> {
    platform::get_user_path()
}

pub fn get_system_path() -> Result<String> {
    platform::get_system_path()
}

/// Update JAVA_HOME and PATH in both user (HKCU) and system (HKLM) environments,
/// then broadcast the change. System writes require admin rights — if they fail,
/// the error is returned so callers can surface a warning instead of silently ignoring it.
pub fn apply_java_version(new_java_home: &str, managed_bins: &[String]) -> Result<ApplyResult> {
    let new_bin = format!("{new_java_home}\\bin");

    // User env — always required; propagate errors.
    platform::set_java_home(new_java_home)?;
    platform::patch_user_path(&new_bin, managed_bins)?;

    // System env — best-effort; capture failure so caller can warn the user.
    let system_result = (|| -> Result<()> {
        platform::set_system_java_home(new_java_home)?;
        platform::patch_system_path(&new_bin, managed_bins)?;
        Ok(())
    })();

    platform::broadcast_env_change()?;

    Ok(ApplyResult {
        system_updated: system_result.is_ok(),
        system_error: system_result.err().map(|e| e.to_string()),
    })
}

/// Outcome of `apply_java_version`.
#[derive(Debug, Clone)]
pub struct ApplyResult {
    /// Whether the system-level (HKLM) environment was also updated.
    pub system_updated: bool,
    /// Error message if the system-level update failed (e.g. not running as admin).
    pub system_error: Option<String>,
}

pub fn broadcast_env_change() -> Result<()> {
    platform::broadcast_env_change()
}

pub fn registry_jdk_homes() -> Vec<String> {
    platform::registry_jdk_homes()
}

pub fn is_elevated() -> bool {
    platform::is_elevated()
}

#[cfg(test)]
mod tests {
    #[test]
    fn path_patch_logic() {
        // Test the pure string logic: remove old bins, prepend new one
        let current = r"C:\old-java\bin;C:\Windows\system32;C:\Users\me\bin";
        let managed_bins = vec![r"C:\old-java\bin".to_string()];
        let new_bin = r"C:\new-java\bin";

        let managed_lower: Vec<String> = managed_bins.iter().map(|s| s.to_lowercase()).collect();
        let new_lower = new_bin.to_lowercase();

        let mut parts: Vec<&str> = current
            .split(';')
            .map(str::trim)
            .filter(|s| {
                if s.is_empty() {
                    return false;
                }
                let lower = s.to_lowercase();
                !managed_lower.iter().any(|m| *m == lower) && lower != new_lower
            })
            .collect();

        let mut result = vec![new_bin];
        result.extend(parts.drain(..));
        let joined = result.join(";");

        assert!(joined.starts_with(new_bin));
        assert!(!joined.contains("old-java"));
        assert!(joined.contains("system32"));
    }
}
