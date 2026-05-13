use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// A single JDK entry stored in config.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JdkEntry {
    pub path: String,
    pub detected_version: Option<String>,
    pub vendor: Option<String>,
}

/// The full config persisted to disk.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Config {
    pub current: Option<String>,
    pub versions: HashMap<String, JdkEntry>,
}

/// A JDK version as exposed to callers (includes runtime state).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JavaVersion {
    pub alias: String,
    pub path: String,
    pub detected_version: Option<String>,
    pub vendor: Option<String>,
    pub is_current: bool,
    pub is_valid: bool,
}

/// A JDK found on disk during a scan.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredJdk {
    pub path: String,
    pub detected_version: Option<String>,
    pub vendor: Option<String>,
    pub suggested_alias: String,
    pub already_configured: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub found: Vec<DiscoveredJdk>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticResult {
    pub checks: Vec<DiagnosticCheck>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticCheck {
    pub name: String,
    pub status: CheckStatus,
    pub message: String,
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CheckStatus {
    Ok,
    Warning,
    Error,
}

/// Output of verifying a JDK by running java -version.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyResult {
    pub alias: String,
    pub java_version_output: Option<String>,
    pub javac_version_output: Option<String>,
    pub path_valid: bool,
}

/// Current environment status.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvStatus {
    pub java_home: Option<String>,
    pub java_home_valid: bool,
    pub current_alias: Option<String>,
    pub java_in_path: Option<String>,
    pub java_version_output: Option<String>,
    pub is_elevated: bool,
}
