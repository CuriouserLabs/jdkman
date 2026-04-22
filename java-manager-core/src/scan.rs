use crate::config::load_config;
use crate::env::registry_jdk_homes;
use crate::java::{detect_version, normalize_path, suggest_alias, validate_jdk_path};
use crate::models::{DiscoveredJdk, ScanResult};
use std::collections::HashSet;
use std::path::Path;

/// Common Windows install locations to probe.
const COMMON_ROOTS: &[&str] = &[
    r"C:\Program Files\Microsoft",
    r"C:\Program Files\Java",
    r"C:\Program Files\Eclipse Adoptium",
    r"C:\Program Files\Eclipse Foundation",
    r"C:\Program Files\Zulu",
    r"C:\Program Files\Amazon Corretto",
    r"C:\Program Files\BellSoft",
    r"C:\Program Files\RedHat",
    r"C:\Program Files\Semeru",
    r"C:\Program Files\IBM",
    r"C:\Program Files (x86)\Java",
    r"C:\Program Files (x86)\Zulu",
    r"C:\Program Files\GraalVM",
    r"C:\Program Files\SapMachine",
];

pub fn scan_for_jdks() -> ScanResult {
    let config = load_config().unwrap_or_default();
    let configured_paths: HashSet<String> = config
        .versions
        .values()
        .map(|v| v.path.to_lowercase())
        .collect();

    let mut seen: HashSet<String> = HashSet::new();
    let mut found: Vec<DiscoveredJdk> = Vec::new();

    // Collect candidate paths from multiple sources
    let mut candidates: Vec<String> = Vec::new();

    // 1. Windows registry
    candidates.extend(registry_jdk_homes());

    // 2. JAVA_HOME env var (may differ from registry if set manually)
    if let Ok(jh) = std::env::var("JAVA_HOME") {
        if !jh.is_empty() {
            candidates.push(jh);
        }
    }

    // 3. File-system scan of common roots
    for root in COMMON_ROOTS {
        let root_path = Path::new(root);
        if !root_path.exists() {
            continue;
        }
        // Maybe the root itself is a JDK
        candidates.push(root.to_string());
        // Probe immediate subdirectories
        if let Ok(entries) = std::fs::read_dir(root_path) {
            for entry in entries.flatten() {
                if entry.path().is_dir() {
                    candidates.push(entry.path().to_string_lossy().to_string());
                }
            }
        }
    }

    // Validate and deduplicate
    for raw_path in candidates {
        let path = normalize_path(&raw_path);
        let key = path.to_lowercase();
        if !seen.insert(key.clone()) {
            continue;
        }
        if validate_jdk_path(&path).is_err() {
            continue;
        }
        let (detected_version, vendor) = detect_version(&path)
            .map(|(v, ve)| (Some(v), Some(ve)))
            .unwrap_or((None, None));
        let suggested_alias = suggest_alias(&path, detected_version.as_deref());
        let already_configured = configured_paths.contains(&key);
        found.push(DiscoveredJdk {
            path,
            detected_version,
            vendor,
            suggested_alias,
            already_configured,
        });
    }

    // Sort: unconfigured first, then by path
    found.sort_by(|a, b| {
        a.already_configured
            .cmp(&b.already_configured)
            .then(a.path.cmp(&b.path))
    });

    ScanResult { found }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scan_returns_struct() {
        // Just ensure the function runs without panicking
        let _result = scan_for_jdks();
    }
}
