use crate::errors::{JdkManagerError, Result};
use crate::models::{Config, JdkEntry};
use std::path::PathBuf;

pub fn config_dir() -> Result<PathBuf> {
    dirs::config_dir()
        .map(|d| d.join("jdkman"))
        .ok_or_else(|| JdkManagerError::Config("Cannot locate user config directory".into()))
}

pub fn config_path() -> Result<PathBuf> {
    Ok(config_dir()?.join("config.json"))
}

pub fn load_config() -> Result<Config> {
    let path = config_path()?;
    if !path.exists() {
        return Ok(Config::default());
    }
    let raw = std::fs::read_to_string(&path)
        .map_err(|e| JdkManagerError::Config(format!("Cannot read config file: {e}")))?;
    // Graceful degradation: if JSON is corrupt, return default and warn
    serde_json::from_str::<Config>(&raw).or_else(|e| {
        eprintln!("Warning: config file is corrupted ({e}), starting fresh.");
        Ok(Config::default())
    })
}

pub fn save_config(config: &Config) -> Result<()> {
    let path = config_path()?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| JdkManagerError::Config(format!("Cannot create config dir: {e}")))?;
    }
    let json = serde_json::to_string_pretty(config)
        .map_err(|e| JdkManagerError::Config(format!("Cannot serialize config: {e}")))?;
    std::fs::write(&path, json)
        .map_err(|e| JdkManagerError::Config(format!("Cannot write config file: {e}")))?;
    Ok(())
}

pub fn add_version(alias: &str, entry: JdkEntry) -> Result<Config> {
    let mut config = load_config()?;
    if config.versions.contains_key(alias) {
        return Err(JdkManagerError::DuplicateAlias(alias.to_string()));
    }
    config.versions.insert(alias.to_string(), entry);
    save_config(&config)?;
    Ok(config)
}

pub fn update_version(alias: &str, entry: JdkEntry) -> Result<Config> {
    let mut config = load_config()?;
    config.versions.insert(alias.to_string(), entry);
    save_config(&config)?;
    Ok(config)
}

pub fn remove_version(alias: &str) -> Result<Config> {
    let mut config = load_config()?;
    if !config.versions.contains_key(alias) {
        return Err(JdkManagerError::AliasNotFound(alias.to_string()));
    }
    config.versions.remove(alias);
    if config.current.as_deref() == Some(alias) {
        config.current = None;
    }
    save_config(&config)?;
    Ok(config)
}

pub fn set_current(alias: &str) -> Result<Config> {
    let mut config = load_config()?;
    if !config.versions.contains_key(alias) {
        return Err(JdkManagerError::AliasNotFound(alias.to_string()));
    }
    config.current = Some(alias.to_string());
    save_config(&config)?;
    Ok(config)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn config_default_is_empty() {
        let c = Config::default();
        assert!(c.current.is_none());
        assert!(c.versions.is_empty());
    }

    #[test]
    fn config_roundtrip() {
        let mut config = Config::default();
        config.current = Some("java21".to_string());
        config.versions.insert(
            "java21".to_string(),
            JdkEntry {
                path: r"C:\Program Files\Java\jdk-21".to_string(),
                detected_version: Some("21.0.2".to_string()),
                vendor: Some("OpenJDK".to_string()),
            },
        );
        let json = serde_json::to_string_pretty(&config).unwrap();
        let restored: Config = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.current, Some("java21".to_string()));
        assert!(restored.versions.contains_key("java21"));
    }

    #[test]
    fn corrupt_json_returns_default() {
        let result: Result<Config> =
            serde_json::from_str::<Config>("NOT_JSON").or_else(|_| Ok(Config::default()));
        assert!(result.is_ok());
        assert!(result.unwrap().versions.is_empty());
    }
}
