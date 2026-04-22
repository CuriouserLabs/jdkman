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
    pub fn broadcast_env_change() -> Result<()> {
        Ok(())
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

/// Update JAVA_HOME and PATH, then broadcast the environment change.
pub fn apply_java_version(new_java_home: &str, managed_bins: &[String]) -> Result<()> {
    let new_bin = format!("{new_java_home}\\bin");
    platform::set_java_home(new_java_home)?;
    platform::patch_user_path(&new_bin, managed_bins)?;
    platform::broadcast_env_change()?;
    Ok(())
}

pub fn broadcast_env_change() -> Result<()> {
    platform::broadcast_env_change()
}

pub fn registry_jdk_homes() -> Vec<String> {
    platform::registry_jdk_homes()
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
