use java_manager_core::{
    config::{config_dir, config_path, load_config},
    doctor,
    java::{create_jdk_entry, make_unique_alias},
    models::{DiagnosticResult, DiscoveredJdk, EnvStatus, JavaVersion, ScanResult, VerifyResult},
    operations,
    scan,
};
use std::collections::HashSet;
use tauri::command;

// ── Version management ────────────────────────────────────────────────────────

#[command]
pub fn list_versions() -> Result<Vec<JavaVersion>, String> {
    operations::list_versions().map_err(|e| e.to_string())
}

#[command]
pub fn add_jdk(alias: String, path: String) -> Result<(), String> {
    operations::add_jdk(&alias, &path).map_err(|e| e.to_string())
}

#[command]
pub fn remove_jdk(alias: String) -> Result<(), String> {
    operations::remove_jdk(&alias).map_err(|e| e.to_string())
}

#[command]
pub fn use_jdk(alias: String) -> Result<(), String> {
    operations::use_jdk(&alias).map_err(|e| e.to_string())
}

#[command]
pub fn verify_jdk(alias: String) -> Result<VerifyResult, String> {
    operations::verify_jdk(&alias).map_err(|e| e.to_string())
}

#[command]
pub fn refresh_jdk(alias: String) -> Result<(), String> {
    operations::refresh_jdk_metadata(&alias).map_err(|e| e.to_string())
}

// ── Environment status ────────────────────────────────────────────────────────

#[command]
pub fn get_env_status() -> Result<EnvStatus, String> {
    operations::env_status().map_err(|e| e.to_string())
}

#[command]
pub fn get_current_alias() -> Result<Option<String>, String> {
    operations::get_current_alias().map_err(|e| e.to_string())
}

// ── Scan ──────────────────────────────────────────────────────────────────────

#[command]
pub fn scan_jdks() -> ScanResult {
    scan::scan_for_jdks()
}

/// Add a single discovered JDK from a scan result. Returns the alias used.
#[command]
pub fn add_discovered_jdk(path: String, suggested_alias: String) -> Result<String, String> {
    let config = load_config().map_err(|e| e.to_string())?;
    let existing: HashSet<String> = config.versions.keys().cloned().collect();
    let alias = make_unique_alias(&suggested_alias, &existing);
    let entry = create_jdk_entry(&path);
    java_manager_core::config::add_version(&alias, entry).map_err(|e| e.to_string())?;
    Ok(alias)
}

/// Add multiple discovered JDKs at once. Returns list of (alias, path) added.
#[command]
pub fn add_all_discovered(jdks: Vec<DiscoveredJdk>) -> Result<Vec<String>, String> {
    let config = load_config().map_err(|e| e.to_string())?;
    let mut existing: HashSet<String> = config.versions.keys().cloned().collect();
    let mut added = Vec::new();

    for jdk in jdks {
        if jdk.already_configured {
            continue;
        }
        let alias = make_unique_alias(&jdk.suggested_alias, &existing);
        let entry = create_jdk_entry(&jdk.path);
        match java_manager_core::config::add_version(&alias, entry) {
            Ok(_) => {
                existing.insert(alias.clone());
                added.push(alias);
            }
            Err(_) => {} // skip duplicates silently
        }
    }
    Ok(added)
}

// ── Diagnostics ───────────────────────────────────────────────────────────────

#[command]
pub fn run_diagnostics() -> DiagnosticResult {
    doctor::run_diagnostics()
}

// ── Config / paths ────────────────────────────────────────────────────────────

#[command]
pub fn get_config_path() -> Result<String, String> {
    config_path()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

#[command]
pub fn get_config_dir() -> Result<String, String> {
    config_dir()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

/// Validate that a path is a proper JDK before adding it.
#[command]
pub fn validate_jdk_path(path: String) -> Result<(), String> {
    java_manager_core::java::validate_jdk_path(&path).map_err(|e| e.to_string())
}

/// Probe metadata (version, vendor) without adding the JDK.
#[command]
pub fn probe_jdk_metadata(path: String) -> Result<(Option<String>, Option<String>), String> {
    java_manager_core::java::validate_jdk_path(&path).map_err(|e| e.to_string())?;
    let (ver, vendor) = java_manager_core::java::detect_version(&path)
        .map(|(v, ve)| (Some(v), Some(ve)))
        .unwrap_or((None, None));
    Ok((ver, vendor))
}

/// Return a suggested alias for a given path.
#[command]
pub fn get_suggested_alias(path: String, version: Option<String>) -> String {
    java_manager_core::java::suggest_alias(&path, version.as_deref())
}

/// Import the current JAVA_HOME (if valid) as a new alias.
#[command]
pub fn import_java_home() -> Result<Option<(String, String)>, String> {
    Ok(operations::suggest_import_from_java_home())
}
