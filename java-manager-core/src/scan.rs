use crate::config::load_config;
use crate::env::registry_jdk_homes;
use crate::java::{detect_version, normalize_path, suggest_alias, validate_jdk_path};
use crate::models::{DiscoveredJdk, ScanResult};
use crate::platform;
use std::collections::HashSet;
use std::path::{Path, PathBuf};

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

    // 1. Platform-native discovery
    candidates.extend(registry_jdk_homes());

    // 2. JAVA_HOME env var (may differ from registry if set manually)
    if let Ok(jh) = std::env::var("JAVA_HOME") {
        if !jh.is_empty() {
            candidates.push(jh);
        }
    }

    // 3. File-system scan of common roots
    for root_path in platform::common_scan_roots() {
        if !root_path.exists() {
            continue;
        }
        for candidate in expand_root_candidates(&root_path) {
            candidates.push(candidate.to_string_lossy().to_string());
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

fn expand_root_candidates(root: &Path) -> Vec<PathBuf> {
    let mut candidates = vec![root.to_path_buf()];

    if let Ok(entries) = std::fs::read_dir(root) {
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }
            candidates.push(path.clone());

            #[cfg(target_os = "macos")]
            {
                let contents_home = path.join("Contents").join("Home");
                if contents_home.is_dir() {
                    candidates.push(contents_home);
                }
            }
        }
    }

    candidates
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
