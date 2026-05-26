use crate::process::command;
use std::path::{Path, PathBuf};

pub fn current_platform() -> &'static str {
    #[cfg(target_os = "windows")]
    {
        "windows"
    }
    #[cfg(target_os = "macos")]
    {
        "macos"
    }
    #[cfg(all(unix, not(target_os = "macos")))]
    {
        "linux"
    }
}

pub fn platform_label() -> &'static str {
    #[cfg(target_os = "windows")]
    {
        "Windows"
    }
    #[cfg(target_os = "macos")]
    {
        "macOS"
    }
    #[cfg(all(unix, not(target_os = "macos")))]
    {
        "Linux"
    }
}

pub fn java_binary_name() -> &'static str {
    #[cfg(windows)]
    {
        "java.exe"
    }
    #[cfg(not(windows))]
    {
        "java"
    }
}

pub fn javac_binary_name() -> &'static str {
    #[cfg(windows)]
    {
        "javac.exe"
    }
    #[cfg(not(windows))]
    {
        "javac"
    }
}

pub fn jdk_bin_dir(path: &str) -> PathBuf {
    Path::new(path).join("bin")
}

pub fn java_binary_path(path: &str) -> PathBuf {
    jdk_bin_dir(path).join(java_binary_name())
}

pub fn javac_binary_path(path: &str) -> PathBuf {
    jdk_bin_dir(path).join(javac_binary_name())
}

pub fn which(cmd: &str) -> Option<String> {
    #[cfg(windows)]
    let mut lookup = command("where");
    #[cfg(not(windows))]
    let mut lookup = command("which");

    let output = lookup.arg(cmd).output().ok()?;
    if !output.status.success() {
        return None;
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let first = stdout.lines().next()?.trim().to_string();
    if first.is_empty() {
        None
    } else {
        Some(first)
    }
}

#[cfg(target_os = "windows")]
pub fn common_scan_roots() -> Vec<PathBuf> {
    vec![
        PathBuf::from(r"C:\Program Files\Microsoft"),
        PathBuf::from(r"C:\Program Files\Java"),
        PathBuf::from(r"C:\Program Files\Eclipse Adoptium"),
        PathBuf::from(r"C:\Program Files\Eclipse Foundation"),
        PathBuf::from(r"C:\Program Files\Zulu"),
        PathBuf::from(r"C:\Program Files\Amazon Corretto"),
        PathBuf::from(r"C:\Program Files\BellSoft"),
        PathBuf::from(r"C:\Program Files\RedHat"),
        PathBuf::from(r"C:\Program Files\Semeru"),
        PathBuf::from(r"C:\Program Files\IBM"),
        PathBuf::from(r"C:\Program Files (x86)\Java"),
        PathBuf::from(r"C:\Program Files (x86)\Zulu"),
        PathBuf::from(r"C:\Program Files\GraalVM"),
        PathBuf::from(r"C:\Program Files\SapMachine"),
    ]
}

#[cfg(target_os = "macos")]
pub fn common_scan_roots() -> Vec<PathBuf> {
    let mut roots = vec![
        PathBuf::from("/Library/Java/JavaVirtualMachines"),
        PathBuf::from("/System/Library/Java/JavaVirtualMachines"),
        PathBuf::from("/opt/homebrew/opt"),
        PathBuf::from("/usr/local/opt"),
    ];

    if let Some(home) = dirs::home_dir() {
        roots.push(home.join("Library/Java/JavaVirtualMachines"));
        roots.push(home.join(".sdkman/candidates/java"));
    }

    roots
}

#[cfg(all(unix, not(target_os = "macos")))]
pub fn common_scan_roots() -> Vec<PathBuf> {
    let mut roots = vec![
        PathBuf::from("/usr/lib/jvm"),
        PathBuf::from("/usr/java"),
        PathBuf::from("/opt/java"),
        PathBuf::from("/opt/jdk"),
    ];

    if let Some(home) = dirs::home_dir() {
        roots.push(home.join(".sdkman/candidates/java"));
    }

    roots
}
