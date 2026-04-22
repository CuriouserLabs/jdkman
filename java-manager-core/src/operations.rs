use crate::config::{
    add_version, load_config, remove_version, set_current, update_version,
};
use crate::env::{apply_java_version, get_java_home};
use crate::errors::{JdkManagerError, Result};
use crate::java::{
    create_jdk_entry, detect_version, normalize_path, run_java_version, suggest_alias,
    validate_jdk_path,
};
use crate::models::{EnvStatus, JavaVersion, VerifyResult};

/// Return all configured Java versions, sorted by alias.
pub fn list_versions() -> Result<Vec<JavaVersion>> {
    let config = load_config()?;
    let mut versions: Vec<JavaVersion> = config
        .versions
        .iter()
        .map(|(alias, entry)| JavaVersion {
            alias: alias.clone(),
            path: entry.path.clone(),
            detected_version: entry.detected_version.clone(),
            vendor: entry.vendor.clone(),
            is_current: config.current.as_deref() == Some(alias),
            is_valid: validate_jdk_path(&entry.path).is_ok(),
        })
        .collect();
    versions.sort_by(|a, b| a.alias.cmp(&b.alias));
    Ok(versions)
}

/// Add a new JDK alias pointing to `path`. The path is validated before saving.
pub fn add_jdk(alias: &str, path: &str) -> Result<()> {
    let path = normalize_path(path);
    validate_jdk_path(&path)?;
    let entry = create_jdk_entry(&path);
    add_version(alias, entry)?;
    Ok(())
}

/// Remove a configured JDK alias.
pub fn remove_jdk(alias: &str) -> Result<()> {
    remove_version(alias)?;
    Ok(())
}

/// Switch the active Java version: updates JAVA_HOME, PATH, and config.
pub fn use_jdk(alias: &str) -> Result<()> {
    let config = load_config()?;
    let entry = config
        .versions
        .get(alias)
        .ok_or_else(|| JdkManagerError::AliasNotFound(alias.to_string()))?;

    validate_jdk_path(&entry.path)?;

    // Collect all managed bins so we can remove them from PATH
    let managed_bins: Vec<String> = config
        .versions
        .values()
        .map(|v| format!("{}\\bin", normalize_path(&v.path)))
        .collect();

    apply_java_version(&entry.path, &managed_bins)?;
    set_current(alias)?;
    Ok(())
}

/// Return the currently selected alias (from config).
pub fn get_current_alias() -> Result<Option<String>> {
    Ok(load_config()?.current)
}

/// Run java -version and javac -version for a specific alias.
pub fn verify_jdk(alias: &str) -> Result<VerifyResult> {
    let config = load_config()?;
    let entry = config
        .versions
        .get(alias)
        .ok_or_else(|| JdkManagerError::AliasNotFound(alias.to_string()))?;

    let path_valid = validate_jdk_path(&entry.path).is_ok();
    let java_exe = format!("{}\\bin\\java.exe", normalize_path(&entry.path));
    let javac_exe = format!("{}\\bin\\javac.exe", normalize_path(&entry.path));

    let java_version_output = run_java_version(&java_exe);
    let javac_version_output = run_java_version(&javac_exe);

    Ok(VerifyResult {
        alias: alias.to_string(),
        java_version_output,
        javac_version_output,
        path_valid,
    })
}

/// Read the current environment status (JAVA_HOME, active java in PATH, etc).
pub fn env_status() -> Result<EnvStatus> {
    let config = load_config()?;
    let java_home = get_java_home();
    let java_home_valid = java_home
        .as_deref()
        .map(|p| validate_jdk_path(p).is_ok())
        .unwrap_or(false);

    let java_in_path = which("java");
    let java_version_output = java_in_path.as_deref().and_then(run_java_version);

    Ok(EnvStatus {
        java_home,
        java_home_valid,
        current_alias: config.current,
        java_in_path,
        java_version_output,
    })
}

/// If JAVA_HOME is already set in the environment, import it as a new alias.
/// Returns the suggested alias name (not yet saved; caller decides to save or not).
pub fn suggest_import_from_java_home() -> Option<(String, String)> {
    let java_home = get_java_home()?;
    if validate_jdk_path(&java_home).is_err() {
        return None;
    }
    let (ver, _) = detect_version(&java_home)
        .map(|(v, ve)| (Some(v), Some(ve)))
        .unwrap_or((None, None));
    let alias = suggest_alias(&java_home, ver.as_deref());
    Some((alias, java_home))
}

/// Re-probe a configured JDK and refresh its metadata in the config.
pub fn refresh_jdk_metadata(alias: &str) -> Result<()> {
    let config = load_config()?;
    let entry = config
        .versions
        .get(alias)
        .ok_or_else(|| JdkManagerError::AliasNotFound(alias.to_string()))?;
    let new_entry = create_jdk_entry(&entry.path.clone());
    update_version(alias, new_entry)?;
    Ok(())
}

fn which(cmd: &str) -> Option<String> {
    let output = std::process::Command::new("where")
        .arg(cmd)
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let stdout = String::from_utf8_lossy(&output.stdout);
    let first = stdout.lines().next()?.trim().to_string();
    if first.is_empty() { None } else { Some(first) }
}
