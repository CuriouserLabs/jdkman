use crate::config::load_config;
use crate::env::get_java_home;
use crate::java::validate_jdk_path;
use crate::models::{CheckStatus, DiagnosticCheck, DiagnosticResult};
use crate::platform;

pub fn run_diagnostics() -> DiagnosticResult {
    let mut checks: Vec<DiagnosticCheck> = Vec::new();

    let config = match load_config() {
        Ok(c) => {
            checks.push(ok("Config", "Config file loaded successfully", None));
            c
        }
        Err(e) => {
            checks.push(error(
                "Config",
                &format!("Cannot load config: {e}"),
                Some("Delete or recreate the config file from the Settings page if it becomes unreadable"),
            ));
            return DiagnosticResult { checks };
        }
    };

    match &config.current {
        None => checks.push(warn(
            "Current Version",
            "No Java version is currently selected",
            Some("Run 'jdkman use <alias>' to activate a version"),
        )),
        Some(alias) => {
            if config.versions.contains_key(alias) {
                checks.push(ok(
                    "Current Version",
                    &format!("Current alias '{alias}' exists in config"),
                    None,
                ));
            } else {
                checks.push(error(
                    "Current Version",
                    &format!("Current alias '{alias}' is not present in the versions list"),
                    Some("Run 'jdkman use <alias>' with a valid alias"),
                ));
            }
        }
    }

    let java_home = get_java_home();
    match &java_home {
        None => checks.push(error(
            "JAVA_HOME",
            "JAVA_HOME is not set in the current environment",
            Some("Run 'jdkman use <alias>' to select a version"),
        )),
        Some(path) => {
            if validate_jdk_path(path).is_ok() {
                checks.push(ok("JAVA_HOME", &format!("JAVA_HOME = {path}"), None));
            } else {
                checks.push(error(
                    "JAVA_HOME",
                    &format!("JAVA_HOME = {path} (path is not a valid JDK)"),
                    Some("Run 'jdkman use <alias>' or 'jdkman export-shell <alias>' to point JAVA_HOME to a valid JDK"),
                ));
            }
        }
    }

    match which("java") {
        Some(p) => checks.push(ok("java in PATH", &format!("Found: {p}"), None)),
        None => checks.push(warn(
            "java in PATH",
            "java is not found in the current terminal's PATH",
            Some(path_refresh_hint()),
        )),
    }

    match which("javac") {
        Some(p) => checks.push(ok("javac in PATH", &format!("Found: {p}"), None)),
        None => checks.push(warn(
            "javac in PATH",
            "javac is not found in the current terminal's PATH",
            Some(path_refresh_hint()),
        )),
    }

    let mut sorted_aliases: Vec<&str> = config.versions.keys().map(String::as_str).collect();
    sorted_aliases.sort();
    for alias in sorted_aliases {
        let entry = &config.versions[alias];
        match validate_jdk_path(&entry.path) {
            Ok(_) => checks.push(ok(
                &format!("JDK '{alias}'"),
                &format!("Path valid: {}", entry.path),
                None,
            )),
            Err(e) => checks.push(error(
                &format!("JDK '{alias}'"),
                &format!("{e}"),
                Some(&format!(
                    "Run 'jdkman remove {alias}' then re-add with a correct path"
                )),
            )),
        }
    }

    if let (Some(alias), Some(jh)) = (&config.current, &java_home) {
        if let Some(entry) = config.versions.get(alias) {
            if entry.path.to_lowercase() != jh.to_lowercase() {
                checks.push(warn(
                    "JAVA_HOME Consistency",
                    &format!(
                        "JAVA_HOME ({jh}) does not match selected alias '{alias}' path ({})",
                        entry.path
                    ),
                    Some(&format!("Run 'jdkman use {alias}' to resync")),
                ));
            }
        }
    }

    DiagnosticResult { checks }
}

fn which(cmd: &str) -> Option<String> {
    platform::which(cmd)
}

fn path_refresh_hint() -> &'static str {
    #[cfg(windows)]
    {
        "Open a new terminal after running 'jdkman use' — Windows env changes do not affect already-open terminals"
    }
    #[cfg(not(windows))]
    {
        "Run 'jdkman export-shell <alias> --shell bash' (or your shell) and evaluate it in the current terminal"
    }
}

fn ok(name: &str, message: &str, suggestion: Option<&str>) -> DiagnosticCheck {
    DiagnosticCheck {
        name: name.to_string(),
        status: CheckStatus::Ok,
        message: message.to_string(),
        suggestion: suggestion.map(String::from),
    }
}

fn warn(name: &str, message: &str, suggestion: Option<&str>) -> DiagnosticCheck {
    DiagnosticCheck {
        name: name.to_string(),
        status: CheckStatus::Warning,
        message: message.to_string(),
        suggestion: suggestion.map(String::from),
    }
}

fn error(name: &str, message: &str, suggestion: Option<&str>) -> DiagnosticCheck {
    DiagnosticCheck {
        name: name.to_string(),
        status: CheckStatus::Error,
        message: message.to_string(),
        suggestion: suggestion.map(String::from),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn diagnostics_runs_without_panic() {
        let result = run_diagnostics();
        assert!(!result.checks.is_empty());
    }

    #[test]
    fn check_status_ordering() {
        assert_ne!(CheckStatus::Ok, CheckStatus::Error);
        assert_ne!(CheckStatus::Warning, CheckStatus::Error);
    }
}
