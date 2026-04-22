use thiserror::Error;

#[derive(Error, Debug)]
pub enum JdkManagerError {
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Invalid JDK path: {0}")]
    InvalidJdkPath(String),

    #[error("Alias already exists: '{0}'")]
    DuplicateAlias(String),

    #[error("Alias not found: '{0}'")]
    AliasNotFound(String),

    #[error("Registry error: {0}")]
    Registry(String),

    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("JSON parse error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("{0}")]
    Other(String),
}

pub type Result<T> = std::result::Result<T, JdkManagerError>;
