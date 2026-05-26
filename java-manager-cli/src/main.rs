use clap::{Parser, Subcommand};
use colored::Colorize;
use java_manager_core::models::{CheckStatus, UseResult};
use java_manager_core::{
    config::{add_version, config_path},
    doctor,
    java::{create_jdk_entry, make_unique_alias, normalize_path, validate_jdk_path},
    operations, platform, scan,
};
use std::collections::HashSet;

fn main() {
    #[cfg(windows)]
    colored::control::set_virtual_terminal(true).ok();

    #[cfg(windows)]
    if !java_manager_core::env::is_elevated() {
        println!(
            "{} Not running as Administrator — system-wide (HKLM) JAVA_HOME/PATH updates will be skipped.",
            "⚠".yellow().bold()
        );
        println!("  User environment (HKCU) updates will still work.");
        println!();
    }

    let cli = Cli::parse();
    if let Err(e) = run(cli) {
        eprintln!("{} {}", "Error:".red().bold(), e);
        std::process::exit(1);
    }
}

#[derive(Parser)]
#[command(
    name = "jdkman",
    about = "Cross-platform Java JDK version manager",
    version,
    long_about = "Manage multiple JDK installations, switch active aliases, and export shell commands for the current session."
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    List,
    Add {
        alias: String,
        path: String,
    },
    Remove {
        alias: String,
        #[arg(long, short = 'f')]
        force: bool,
    },
    Use {
        alias: String,
    },
    Current,
    Scan {
        #[arg(long, short = 'a')]
        auto_add: bool,
    },
    Doctor,
    ExportShell {
        alias: String,
        #[arg(long)]
        shell: Option<String>,
    },
}

fn run(cli: Cli) -> anyhow::Result<()> {
    match cli.command {
        Commands::List => cmd_list(),
        Commands::Add { alias, path } => cmd_add(&alias, &path),
        Commands::Remove { alias, force } => cmd_remove(&alias, force),
        Commands::Use { alias } => cmd_use(&alias),
        Commands::Current => cmd_current(),
        Commands::Scan { auto_add } => cmd_scan(auto_add),
        Commands::Doctor => cmd_doctor(),
        Commands::ExportShell { alias, shell } => cmd_export_shell(&alias, shell.as_deref()),
    }
}

fn cmd_list() -> anyhow::Result<()> {
    let versions = operations::list_versions()?;
    if versions.is_empty() {
        println!("{}", "No Java versions configured.".dimmed());
        println!(
            "Use {} to add one, or {} to auto-detect.",
            "'jdkman add <alias> <path>'".cyan(),
            "'jdkman scan --auto-add'".cyan()
        );
        return Ok(());
    }

    println!("{}", "Configured Java Versions".bold().underline());
    println!();
    let name_w = versions
        .iter()
        .map(|v| v.alias.len())
        .max()
        .unwrap_or(10)
        .max(10);

    for v in &versions {
        let marker = if v.is_current {
            "▶".green().bold()
        } else {
            " ".normal()
        };
        let alias = if v.is_current {
            v.alias.green().bold()
        } else {
            v.alias.normal()
        };
        let ver_str = v.detected_version.as_deref().unwrap_or("unknown").cyan();
        let vendor = v.vendor.as_deref().unwrap_or("").dimmed();
        let validity = if v.is_valid {
            "".normal()
        } else {
            " [INVALID PATH]".red().bold()
        };
        println!(
            "{marker} {alias:<name_w$}  {ver_str:<12}  {vendor:<20}  {}{}",
            v.path.dimmed(),
            validity,
            name_w = name_w
        );
    }
    println!();
    println!("Total: {} version(s) configured.", versions.len());
    Ok(())
}

fn cmd_add(alias: &str, path: &str) -> anyhow::Result<()> {
    print!("Validating path... ");
    validate_jdk_path(path).map_err(|e| anyhow::anyhow!("{e}"))?;
    println!("{}", "OK".green());

    print!("Probing JDK metadata... ");
    let entry = create_jdk_entry(path);
    let ver_display = entry.detected_version.as_deref().unwrap_or("unknown");
    let vendor_display = entry.vendor.as_deref().unwrap_or("unknown");
    println!("{} ({vendor_display} {ver_display})", "Done".green());

    add_version(alias, entry).map_err(|e| anyhow::anyhow!("{e}"))?;

    println!();
    println!(
        "{} Added alias '{}' → {}",
        "✔".green().bold(),
        alias.cyan(),
        path.dimmed()
    );
    println!(
        "Run {} to activate it.",
        format!("'jdkman use {alias}'").cyan()
    );
    Ok(())
}

fn cmd_remove(alias: &str, force: bool) -> anyhow::Result<()> {
    if !force {
        print!("Remove alias '{}'? [y/N] ", alias.cyan());
        let mut input = String::new();
        std::io::stdin().read_line(&mut input)?;
        if !input.trim().eq_ignore_ascii_case("y") {
            println!("Cancelled.");
            return Ok(());
        }
    }
    operations::remove_jdk(alias).map_err(|e| anyhow::anyhow!("{e}"))?;
    println!("{} Removed alias '{}'.", "✔".green().bold(), alias.cyan());
    Ok(())
}

fn cmd_use(alias: &str) -> anyhow::Result<()> {
    print!("Switching to '{}'... ", alias.cyan());
    let result = operations::use_jdk(alias).map_err(|e| anyhow::anyhow!("{e}"))?;
    println!("{}", "Done".green());

    let config = java_manager_core::config::load_config()?;
    if let Some(entry) = config.versions.get(alias) {
        println!();
        println!(
            "{} Active version : {}",
            "✔".green().bold(),
            alias.green().bold()
        );
        println!("  JAVA_HOME      : {}", entry.path.cyan());
        if let Some(ver) = &entry.detected_version {
            println!("  Java version   : {}", ver.cyan());
        }
    }

    print_use_followup(alias, &result);
    Ok(())
}

fn print_use_followup(alias: &str, result: &UseResult) {
    println!();

    if result.requires_shell_eval {
        let shell = default_unix_shell_name();
        println!(
            "{} Selected '{}' for {}.",
            "ℹ".blue(),
            alias.cyan(),
            result.platform
        );
        println!(
            "  Apply it in the current shell with {}.",
            format!("'jdkman export-shell {alias} --shell {shell}'").cyan()
        );
        println!(
            "  Example: {}",
            format!("eval \"$(jdkman export-shell {alias} --shell {shell})\"").cyan()
        );
    } else {
        println!(
            "{} PATH and JAVA_HOME updated in the user environment.",
            "ℹ".blue()
        );
        if let Some(warn) = &result.warning {
            println!(
                "{} System environment (HKLM) not updated: {}",
                "⚠".yellow(),
                warn.dimmed()
            );
            println!("  Run as Administrator to also apply changes system-wide.");
        } else {
            println!(
                "{} System environment (HKLM) updated — all users and new processes will see the change.",
                "✔".green()
            );
        }
        println!(
            "{} Open a {} terminal for the changes to take effect in shells.",
            "⚠".yellow(),
            "new".bold()
        );
        println!(
            "  Or run {} to apply in the current session.",
            format!("'jdkman export-shell {alias}'").cyan()
        );
    }
}

fn cmd_current() -> anyhow::Result<()> {
    let status = operations::env_status().map_err(|e| anyhow::anyhow!("{e}"))?;

    println!("{}", "Current Java Status".bold().underline());
    println!();
    println!("  Platform       : {}", status.platform.cyan());

    match &status.current_alias {
        Some(alias) => println!("  Config alias   : {}", alias.green().bold()),
        None => println!("  Config alias   : {}", "not set".dimmed()),
    }

    match &status.java_home {
        Some(jh) => {
            let validity = if status.java_home_valid {
                "".normal()
            } else {
                " [invalid]".red()
            };
            println!("  JAVA_HOME      : {}{validity}", jh.cyan());
        }
        None => println!("  JAVA_HOME      : {}", "not set".red()),
    }

    match &status.java_in_path {
        Some(p) => println!("  java in PATH   : {}", p.cyan()),
        None => {
            let guidance = if status.platform == "Windows" {
                "open a new terminal to pick up changes"
            } else {
                "run export-shell to apply the selected alias"
            };
            println!("  java in PATH   : {} ({guidance})", "not found".yellow());
        }
    }

    if let Some(ver_output) = &status.java_version_output {
        println!();
        println!("  java -version output:");
        for line in ver_output.lines() {
            println!("    {}", line.dimmed());
        }
    }
    Ok(())
}

fn cmd_scan(auto_add: bool) -> anyhow::Result<()> {
    println!("Scanning for installed JDKs...");
    let result = scan::scan_for_jdks();

    if result.found.is_empty() {
        println!("{}", "No JDKs found in common install locations.".dimmed());
        println!(
            "Add one manually with: {}",
            "'jdkman add <alias> <path>'".cyan()
        );
        return Ok(());
    }

    println!();
    println!("{}", format!("Found {} JDK(s):", result.found.len()).bold());
    println!();

    let mut existing_aliases: HashSet<String> = java_manager_core::config::load_config()
        .map(|c| c.versions.keys().cloned().collect())
        .unwrap_or_default();

    let mut added = 0usize;

    for jdk in &result.found {
        let status_label = if jdk.already_configured {
            "[already configured]".green()
        } else {
            "[new]".yellow()
        };
        let ver = jdk.detected_version.as_deref().unwrap_or("?");
        let vendor = jdk.vendor.as_deref().unwrap_or("?");
        println!(
            "  {} {} — {} {}  ({})",
            status_label,
            jdk.path.cyan(),
            vendor.dimmed(),
            ver.dimmed(),
            format!("suggested alias: {}", jdk.suggested_alias).dimmed()
        );

        if auto_add && !jdk.already_configured {
            let alias = make_unique_alias(&jdk.suggested_alias, &existing_aliases);
            let entry = create_jdk_entry(&jdk.path);
            match add_version(&alias, entry) {
                Ok(_) => {
                    existing_aliases.insert(alias.clone());
                    println!("    {} Added as '{}'", "✔".green(), alias.cyan());
                    added += 1;
                }
                Err(e) => println!("    {} Failed to add: {e}", "✗".red()),
            }
        }
    }

    if auto_add {
        println!();
        if added > 0 {
            println!("{} Added {added} new JDK(s) to config.", "✔".green().bold());
        } else {
            println!(
                "{}",
                "No new JDKs were added (all already configured).".dimmed()
            );
        }
    } else {
        println!();
        println!(
            "Run {} to add all new ones automatically.",
            "'jdkman scan --auto-add'".cyan()
        );
        println!(
            "Or run {} to add a specific one.",
            "'jdkman add <alias> <path>'".cyan()
        );
    }
    Ok(())
}

fn cmd_doctor() -> anyhow::Result<()> {
    println!("{}", "Diagnostics Report".bold().underline());
    println!();

    let result = doctor::run_diagnostics();
    let name_w = result
        .checks
        .iter()
        .map(|c| c.name.len())
        .max()
        .unwrap_or(20)
        .max(20);

    for check in &result.checks {
        let (icon, colored_name) = match check.status {
            CheckStatus::Ok => ("✔".green().bold(), check.name.green()),
            CheckStatus::Warning => ("⚠".yellow().bold(), check.name.yellow()),
            CheckStatus::Error => ("✗".red().bold(), check.name.red()),
        };
        println!(
            "{icon}  {colored_name:<name_w$}  {}",
            check.message.dimmed(),
            name_w = name_w
        );
        if let Some(sug) = &check.suggestion {
            println!("   {:<name_w$}  ↳ {}", "", sug.italic(), name_w = name_w);
        }
    }

    println!();
    let ok_count = result
        .checks
        .iter()
        .filter(|c| c.status == CheckStatus::Ok)
        .count();
    let warn_count = result
        .checks
        .iter()
        .filter(|c| c.status == CheckStatus::Warning)
        .count();
    let err_count = result
        .checks
        .iter()
        .filter(|c| c.status == CheckStatus::Error)
        .count();
    println!(
        "Summary: {} OK  {} warning(s)  {} error(s)",
        ok_count.to_string().green().bold(),
        warn_count.to_string().yellow().bold(),
        err_count.to_string().red().bold()
    );

    if err_count > 0 {
        let config_path = config_path()
            .map(|p| p.display().to_string())
            .unwrap_or_default();
        println!();
        println!("Config file location: {}", config_path.dimmed());
    }
    Ok(())
}

fn cmd_export_shell(alias: &str, shell: Option<&str>) -> anyhow::Result<()> {
    let config = java_manager_core::config::load_config()?;
    let entry = config
        .versions
        .get(alias)
        .ok_or_else(|| anyhow::anyhow!("Alias '{alias}' not found"))?;

    let shell = shell.unwrap_or(default_shell_for_platform());
    let output = render_export_shell(&normalize_path(&entry.path), shell)?;
    println!("{output}");
    Ok(())
}

fn render_export_shell(java_home: &str, shell: &str) -> anyhow::Result<String> {
    let java_bin = platform::jdk_bin_dir(java_home)
        .to_string_lossy()
        .to_string();

    let rendered = match shell.to_lowercase().as_str() {
        "powershell" | "ps" | "ps1" => format!(
            "# Run these commands in your current PowerShell session:\n$env:JAVA_HOME = '{}'\n$env:PATH = '{};' + $env:PATH",
            java_home, java_bin
        ),
        "cmd" | "bat" => format!(
            ":: Run these commands in your current CMD session:\nSET JAVA_HOME={}\nSET PATH={};%PATH%",
            java_home, java_bin
        ),
        "bash" | "zsh" => format!(
            "export JAVA_HOME='{}'\nexport PATH='{}':\"$PATH\"",
            shell_escape_single(java_home),
            shell_escape_single(&java_bin)
        ),
        "fish" => format!(
            "set -gx JAVA_HOME '{}'\nset -gx PATH '{}' $PATH",
            shell_escape_single(java_home),
            shell_escape_single(&java_bin)
        ),
        _ => anyhow::bail!(
            "Unknown shell '{}'. Use 'powershell', 'cmd', 'bash', 'zsh', or 'fish'.",
            shell
        ),
    };

    Ok(rendered)
}

fn default_shell_for_platform() -> &'static str {
    #[cfg(windows)]
    {
        "powershell"
    }
    #[cfg(not(windows))]
    {
        "bash"
    }
}

fn default_unix_shell_name() -> &'static str {
    if let Ok(shell) = std::env::var("SHELL") {
        if shell.contains("zsh") {
            return "zsh";
        }
        if shell.contains("fish") {
            return "fish";
        }
    }
    "bash"
}

fn shell_escape_single(value: &str) -> String {
    value.replace('\'', "'\"'\"'")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn export_shell_supports_bash() {
        let rendered = render_export_shell("/opt/jdk-21", "bash").unwrap();
        assert!(rendered.contains("export JAVA_HOME='/opt/jdk-21'"));
        assert!(rendered.contains("export PATH='"));
        assert!(rendered.contains("\"$PATH\""));
    }

    #[test]
    fn export_shell_supports_fish() {
        let rendered = render_export_shell("/opt/jdk-21", "fish").unwrap();
        assert!(rendered.contains("set -gx JAVA_HOME '/opt/jdk-21'"));
        assert!(rendered.contains("set -gx PATH '"));
        assert!(rendered.contains("$PATH"));
    }
}
