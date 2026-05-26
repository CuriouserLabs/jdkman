<p align="center">
  <strong>JDK Manager</strong><br>
  <em>Cross-platform Java version management for Windows, macOS, and Linux</em>
</p>

<p align="center">
  <a href="#installation">Install</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#cli-reference">CLI Reference</a> ·
  <a href="#desktop-app">Desktop App</a> ·
  <a href="#building-from-source">Build</a>
</p>

---

## What is JDK Manager?

**JDK Manager** (`jdkman`) helps you manage multiple JDK installations from one shared config.

It ships as two interfaces:

| Interface | Technology | Description |
|-----------|------------|-------------|
| CLI | Rust + Clap | Fast terminal workflow for managing aliases and shell activation |
| Desktop App | Rust + Tauri 2 + React | Visual dashboard for discovery, validation, and switching |

Both interfaces use the same `config.json`, so changes made in one are reflected in the other.

---

## Platform behavior

### Windows

- `jdkman use <alias>` updates `JAVA_HOME` and `PATH` in the user environment
- system-wide environment updates are attempted when running with Administrator rights
- already-open terminals still need to be reopened, or you can use `export-shell`

### macOS and Linux

- `jdkman use <alias>` marks the selected alias in config
- your current shell is unchanged until you evaluate `export-shell`
- v1 does **not** edit `~/.zshrc`, `~/.bashrc`, `/etc/environment`, or similar files

---

## Features

- Discover installed JDKs from common platform-specific locations
- Register custom aliases like `java8`, `graal21`, or `project-x`
- Switch active aliases from the CLI or desktop app
- Export activation commands for `powershell`, `cmd`, `bash`, `zsh`, and `fish`
- Run diagnostics for config validity, `JAVA_HOME`, `PATH`, and JDK paths
- Import an existing `JAVA_HOME` into managed config

---

## Installation

### CLI

Build from source:

```bash
git clone https://github.com/your-org/jdkman.git
cd jdkman
cargo build -p java-manager-cli --release
```

Output:

- Windows: `target\release\jdkman.exe`
- macOS/Linux: `target/release/jdkman`

### Desktop App

Build installers or native bundles from source with the platform-specific scripts in `java-manager-desktop/package.json`.

First-release desktop artifacts:

- Windows: NSIS `.exe`, MSI `.msi`
- macOS: `.app`, `.dmg`
- Linux: AppImage, `.deb`

---

## Quick Start

### Scan and configure JDKs

```bash
jdkman scan --auto-add
jdkman list
```

### Select a version

```bash
jdkman use java21
```

### Apply it in the current shell

Windows PowerShell:

```powershell
Invoke-Expression (jdkman export-shell java21 --shell powershell)
```

macOS/Linux bash or zsh:

```bash
eval "$(jdkman export-shell java21 --shell bash)"
```

fish:

```fish
jdkman export-shell java21 --shell fish | source
```

### Verify the result

```bash
jdkman current
jdkman doctor
```

---

## CLI Reference

```text
jdkman <command> [options]
```

| Command | Description |
|---------|-------------|
| `list` | List configured JDK aliases |
| `add <alias> <path>` | Add a JDK alias |
| `remove <alias>` | Remove an alias from config |
| `use <alias>` | Select and activate a JDK |
| `current` | Show current alias, `JAVA_HOME`, and `java -version` |
| `scan [--auto-add]` | Discover JDKs from common install locations |
| `doctor` | Run environment diagnostics |
| `export-shell <alias> [--shell ...]` | Print shell commands for the current session |

Supported `export-shell` targets:

- `powershell`
- `cmd`
- `bash`
- `zsh`
- `fish`

---

## Desktop App

The desktop app provides:

- Dashboard: current alias, `JAVA_HOME`, `PATH`, and `java -version`
- Versions: add, verify, remove, and switch aliases
- Scan: auto-discover JDKs for the current platform
- Diagnostics: config and environment checks
- Settings: config path, import, and platform-specific behavior notes

---

## Building from Source

See [BUILD.md](BUILD.md) for platform-specific prerequisites and commands.

Quick commands:

```bash
# Workspace tests
cargo test

# CLI release build
cargo build -p java-manager-cli --release

# Desktop frontend
cd java-manager-desktop
npm install
npm run build

# Desktop bundle
npm run tauri:build
```

Platform bundle helpers:

- `npm run tauri:bundle:windows`
- `npm run tauri:bundle:macos`
- `npm run tauri:bundle:linux`

---

## Project Structure

```text
jdkman/
├── java-manager-core/        Shared Rust library
├── java-manager-cli/         CLI binary
├── java-manager-desktop/     Tauri desktop app
├── public-web/               Marketing site
├── BUILD.md                  Build and release guide
└── Cargo.toml                Workspace root
```

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
