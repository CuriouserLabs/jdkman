use crate::errors::{JdkManagerError, Result};
use crate::models::JdkEntry;
use crate::platform;
use crate::process::command;
use std::path::Path;

/// Returns Ok if the path contains a valid JDK for the current OS.
pub fn validate_jdk_path(path: &str) -> Result<()> {
    let base = Path::new(path);
    if !base.exists() {
        return Err(JdkManagerError::InvalidJdkPath(format!(
            "Path does not exist: {path}"
        )));
    }
    if !base.is_dir() {
        return Err(JdkManagerError::InvalidJdkPath(format!(
            "Path is not a directory: {path}"
        )));
    }
    let java_bin = platform::java_binary_path(path);
    if !java_bin.exists() {
        return Err(JdkManagerError::InvalidJdkPath(format!(
            "{}/{} not found in: {path}",
            "bin",
            platform::java_binary_name()
        )));
    }
    let javac_bin = platform::javac_binary_path(path);
    if !javac_bin.exists() {
        return Err(JdkManagerError::InvalidJdkPath(format!(
            "{}/{} not found in: {path} (this looks like a JRE, not a full JDK)",
            "bin",
            platform::javac_binary_name()
        )));
    }
    Ok(())
}

/// Read the 'release' file to get version and vendor metadata quickly.
/// Falls back to running java -version if the release file is missing or incomplete.
pub fn detect_version(path: &str) -> Option<(String, String)> {
    // Try release file first — fastest and no subprocess
    let release_path = Path::new(path).join("release");
    if let Ok(content) = std::fs::read_to_string(&release_path) {
        let mut version: Option<String> = None;
        let mut vendor: Option<String> = None;
        for line in content.lines() {
            if line.starts_with("JAVA_VERSION=") {
                version = Some(line["JAVA_VERSION=".len()..].trim_matches('"').to_string());
            } else if line.starts_with("IMPLEMENTOR=") {
                vendor = Some(line["IMPLEMENTOR=".len()..].trim_matches('"').to_string());
            }
        }
        if let Some(v) = version {
            return Some((v, vendor.unwrap_or_else(|| "Unknown".to_string())));
        }
    }

    // Fallback: run java -version
    let java_bin = platform::java_binary_path(path);
    if !java_bin.exists() {
        return None;
    }
    let output = command(&java_bin).arg("-version").output().ok()?;
    // java -version writes to stderr
    let stderr = String::from_utf8_lossy(&output.stderr);
    parse_java_version_output(&stderr)
}

fn parse_java_version_output(output: &str) -> Option<(String, String)> {
    for line in output.lines() {
        if line.contains("version") {
            if let Some(start) = line.find('"') {
                if let Some(end) = line[start + 1..].find('"') {
                    let ver = line[start + 1..start + 1 + end].to_string();
                    let vendor = if line.starts_with("openjdk") {
                        "OpenJDK".to_string()
                    } else if line.starts_with("java") {
                        "Oracle".to_string()
                    } else {
                        "Unknown".to_string()
                    };
                    return Some((ver, vendor));
                }
            }
        }
    }
    None
}

/// Run java -version for a specific java binary and return the output string.
pub fn run_java_version(java_bin: &str) -> Option<String> {
    let output = command(java_bin).arg("-version").output().ok()?;
    let stderr = String::from_utf8_lossy(&output.stderr);
    let stdout = String::from_utf8_lossy(&output.stdout);
    let combined = format!("{stderr}{stdout}");
    let trimmed = combined.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

/// Build a JdkEntry by probing the given path.
pub fn create_jdk_entry(path: &str) -> JdkEntry {
    let (detected_version, vendor) = detect_version(path)
        .map(|(v, ve)| (Some(v), Some(ve)))
        .unwrap_or((None, None));
    JdkEntry {
        path: normalize_path(path),
        detected_version,
        vendor,
    }
}

/// Normalize a JDK path by trimming trailing separators.
pub fn normalize_path(path: &str) -> String {
    path.trim_end_matches(['\\', '/']).to_string()
}

/// Suggest an alias like "java17" or "java21" based on version or path heuristics.
pub fn suggest_alias(path: &str, version: Option<&str>) -> String {
    if let Some(ver) = version {
        let major = ver.split('.').next().unwrap_or("0");
        // Handle Java 8 which reports as "1.8.x"
        if major == "1" {
            let minor = ver.split('.').nth(1).unwrap_or("8");
            return format!("java{minor}");
        }
        return format!("java{major}");
    }
    // Guess from path components
    let path_lower = path.to_lowercase();
    for ver in [
        "24", "23", "22", "21", "20", "19", "18", "17", "16", "15", "14", "13", "12", "11", "8",
    ] {
        let patterns = [
            format!("-{ver}."),
            format!("-{ver}\\"),
            format!("_{ver}."),
            format!("jdk{ver}"),
            format!("jdk-{ver}"),
            format!("jdk {ver}"),
        ];
        if patterns.iter().any(|p| path_lower.contains(p.as_str())) {
            return format!("java{ver}");
        }
    }
    "java".to_string()
}

/// Make an alias unique by appending a number if it already exists.
pub fn make_unique_alias(base: &str, existing: &std::collections::HashSet<String>) -> String {
    if !existing.contains(base) {
        return base.to_string();
    }
    let mut n = 2;
    loop {
        let candidate = format!("{base}-{n}");
        if !existing.contains(&candidate) {
            return candidate;
        }
        n += 1;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn suggest_alias_from_version() {
        assert_eq!(suggest_alias("/any/path", Some("21.0.2")), "java21");
        assert_eq!(suggest_alias("/any/path", Some("17.0.9")), "java17");
        assert_eq!(suggest_alias("/any/path", Some("11.0.21")), "java11");
        // Java 8 "1.8.0_401" format
        assert_eq!(suggest_alias("/any/path", Some("1.8.0_401")), "java8");
    }

    #[test]
    fn suggest_alias_from_path() {
        assert_eq!(
            suggest_alias(r"C:\Program Files\Microsoft\jdk-21.0.2.13-hotspot", None),
            "java21"
        );
        assert_eq!(
            suggest_alias(
                r"C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot",
                None
            ),
            "java17"
        );
    }

    #[test]
    fn make_unique_alias_no_conflict() {
        let existing = std::collections::HashSet::new();
        assert_eq!(make_unique_alias("java21", &existing), "java21");
    }

    #[test]
    fn make_unique_alias_with_conflict() {
        let mut existing = std::collections::HashSet::new();
        existing.insert("java21".to_string());
        existing.insert("java21-2".to_string());
        assert_eq!(make_unique_alias("java21", &existing), "java21-3");
    }

    #[test]
    fn normalize_path_trims_slashes() {
        assert_eq!(normalize_path(r"C:\foo\bar\"), r"C:\foo\bar");
        assert_eq!(normalize_path(r"C:\foo\bar"), r"C:\foo\bar");
        assert_eq!(normalize_path("/opt/jdk-21/"), "/opt/jdk-21");
    }

    #[test]
    fn parse_version_output_openjdk() {
        let output = r#"openjdk version "21.0.2" 2024-01-16
OpenJDK Runtime Environment (build 21.0.2+13-58)
OpenJDK 64-Bit Server VM (build 21.0.2+13-58, mixed mode, sharing)"#;
        let result = parse_java_version_output(output);
        assert_eq!(result, Some(("21.0.2".to_string(), "OpenJDK".to_string())));
    }
}
