<p align="center">
  <strong>JDK Manager</strong><br>
  <em>A Windows-first Java version manager — CLI + Desktop App</em>
</p>

<p align="center">
  <a href="#installation">Install</a> ·
  <a href="#cli-reference">CLI Reference</a> ·
  <a href="#desktop-app">Desktop App</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#building-from-source">Build</a>
</p>

---

## What is JDK Manager?

**JDK Manager** (`jdkman`) is a tool for managing multiple JDK installations on Windows. It replaces the tedious cycle of manually editing `JAVA_HOME`, reordering `PATH`, and guessing which `java.exe` is actually active.

It ships as two interfaces that share the same core library and configuration:

| Interface | Technology | Description |
|-----------|-----------|-------------|
| **CLI** — `jdkman.exe` | Rust + [Clap](https://github.com/clap-rs/clap) | Fast, scriptable terminal workflow |
| **Desktop App** | Rust + [Tauri 2](https://tauri.app/) + React | Visual dashboard for point-and-click management |

Both interfaces read and write the same `config.json` and modify the same Windows environment variables, so you can use them interchangeably.

---

## Features

- **Auto-discover installed JDKs** — scans the Windows registry, `JAVA_HOME`, and common vendor directories:
  - `C:\Program Files\Java` (Oracle)
  - Eclipse Adoptium / Temurin
  - Amazon Corretto
  - Azul Zulu
  - BellSoft Liberica
  - GraalVM
  - SapMachine
  - Microsoft Build of OpenJDK
- **Alias-based version switching** — name each JDK however you want (`java8`, `graal21`, `project-x`, etc.) and switch with one command
- **Windows environment integration** — updates `JAVA_HOME` and `PATH` in the user registry (`HKCU`), broadcasts `WM_SETTINGCHANGE` so new processes pick up changes immediately
- **Built-in diagnostics** (`doctor`) — validates config health, alias consistency, JDK path validity, and whether `java`/`javac` resolve correctly
- **Import existing `JAVA_HOME`** — bring your current setup into managed aliases without reconfiguration
- **Session export commands** — `export-shell` emits ready-to-paste PowerShell or CMD commands for immediate in-session updates
- **Administrator awareness** — clearly explains when system-wide (`HKLM`) changes need elevated access

---

## Installation

### CLI

Download `jdkman.exe` from the [Releases](#) page, or build from source:

```powershell
# Clone the repo
git clone https://github.com/your-org/jdkman.git
cd jdkman

# Build the CLI binary
cargo build -p java-manager-cli --release

# The binary is at: target\release\jdkman.exe
```

Place `jdkman.exe` anywhere on your `PATH`:

```powershell
Copy-Item target\release\jdkman.exe "$env:USERPROFILE\bin\jdkman.exe"
```

### Desktop App

Download the installer from the [Releases](#) page:

| Installer | Admin Required | Notes |
|-----------|---------------|-------|
| **NSIS** (`.exe`) | No | Installs per-user; optionally adds the CLI to `PATH` |
| **MSI** (`.msi`) | Yes | Standard Windows Installer package |

Or build from source — see [Building from Source](#building-from-source).

### Requirements

- **Windows 10/11** (x64)
- **WebView2** runtime (pre-installed on Windows 10 21H2+ and Windows 11)

---

## Quick Start

```powershell
# 1. Scan your system for installed JDKs and add them automatically
jdkman scan --auto-add

# 2. List what was found
jdkman list

# 3. Switch to a specific version
jdkman use adoptium-21

# 4. Verify the active version
jdkman current

# 5. Run diagnostics to check environment health
jdkman doctor
```

---

## CLI Reference

```
jdkman <command> [options]
```

| Command | Description |
|---------|-------------|
| `list` | List all configured JDK aliases with version, vendor, path, and validity |
| `add <alias> <path>` | Register a JDK with a custom alias — validates the path and probes metadata |
| `remove <alias> [-f]` | Remove an alias from configuration (with optional `--force` to skip confirmation) |
| `use <alias>` | Activate a JDK — updates `JAVA_HOME` and `PATH` in the Windows user environment |
| `current` | Show the active alias, `JAVA_HOME`, `java` location in PATH, and `java -version` output |
| `scan [--auto-add]` | Discover JDKs in the registry and common vendor directories; optionally add all new finds |
| `doctor` | Run environment health checks with fix suggestions |
| `export-shell <alias> [--shell powershell\|cmd]` | Print shell commands to activate a version in the current terminal session |

### Usage Examples

**Scan and auto-add:**

```powershell
$ jdkman scan --auto-add
Found 4 JDK(s):
  [new] C:\Program Files\Eclipse Adoptium\jdk-21 — Adoptium 21.0.3
    ✔ Added as 'adoptium-21'
  [already configured] C:\Program Files\Amazon Corretto\jdk17
```

**Switch versions:**

```powershell
$ jdkman use adoptium-21
✔ Active version : adoptium-21
  JAVA_HOME      : C:\Program Files\Eclipse Adoptium\jdk-21
  Java version   : 21.0.3
ℹ PATH and JAVA_HOME updated in user environment (HKCU).
⚠ Open a new terminal for the changes to take effect in shells.
```

**Apply to the current session without reopening the terminal:**

```powershell
# Print the commands:
$ jdkman export-shell adoptium-21 --shell powershell

# Or evaluate them directly:
Invoke-Expression (jdkman export-shell adoptium-21 --shell powershell)
```

**Diagnose problems:**

```powershell
$ jdkman doctor
✔ Config file           Config file exists and is readable
✔ Active alias          'adoptium-21' is valid and path exists
✔ JAVA_HOME             Matches active alias path
⚠ System environment    Not updated — run as Administrator
```

---

## Desktop App

The Tauri desktop app provides a visual interface to the same workflow:

| Page | Purpose |
|------|---------|
| **Dashboard** | Active alias, `JAVA_HOME` value, `PATH` status, and `java -version` output at a glance |
| **Versions** | Add, verify, open folder, remove, and one-click activate any managed JDK |
| **Scan** | Search the Windows registry and common vendor directories for installed JDKs |
| **Diagnostics** | Warnings, errors, and guided fix suggestions for your Java environment |
| **Settings** | Config file access, import existing `JAVA_HOME`, and application preferences |

The desktop app reads and writes the same `config.json` as the CLI, so changes in either interface are immediately visible in the other.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│               java-manager-core                 │
│                                                 │
│  config.rs     Load/save JSON config            │
│  models.rs     Shared data types                │
│  errors.rs     Typed error enum                 │
│  java.rs       JDK validation & metadata probe  │
│  env.rs        Windows registry reads/writes    │
│  scan.rs       Filesystem & registry scanner    │
│  doctor.rs     Environment diagnostics          │
│  operations.rs High-level API                   │
│  process.rs    Child process helpers            │
└──────────┬──────────────────┬───────────────────┘
           │                  │
  ┌────────▼─────────┐  ┌────▼────────────────────┐
  │ java-manager-cli │  │  java-manager-desktop    │
  │  (jdkman.exe)    │  │                          │
  │  Clap commands   │  │  Tauri 2 backend         │
  │  Colored output  │  │  #[tauri::command] API   │
  └──────────────────┘  │  ┌────────────────────┐  │
                        │  │ React + TypeScript  │  │
                        │  │ Tailwind CSS UI     │  │
                        │  │ React Router        │  │
                        │  └────────────────────┘  │
                        └──────────────────────────┘
```

### How version switching works

When `jdkman use <alias>` is called:

1. **`HKCU\Environment\JAVA_HOME`** is written via the `winreg` crate
2. **`HKCU\Environment\Path`** is updated — previously-managed Java `bin` paths are removed and the new one is prepended
3. **`WM_SETTINGCHANGE`** is broadcast via `SendMessageTimeoutW(HWND_BROADCAST, ...)` so new processes pick up the change immediately
4. The config file is updated with the new active alias

> **Note:** Already-open terminals will not see the change. Open a new terminal, or run `jdkman export-shell <alias>` to apply changes to the current session.

### Config file

Stored at `%APPDATA%\jdkman\config.json`:

```json
{
  "current": "adoptium-21",
  "versions": {
    "corretto-17": {
      "path": "C:\\Program Files\\Amazon Corretto\\jdk17.0.11_9",
      "detected_version": "17.0.11",
      "vendor": "Amazon Corretto"
    },
    "adoptium-21": {
      "path": "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.3.9-hotspot",
      "detected_version": "21.0.3",
      "vendor": "Eclipse Adoptium"
    }
  }
}
```

---

## Building from Source

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Rust | 1.77+ | [rustup.rs](https://rustup.rs) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Bundled with Node.js |
| Tauri CLI | 2.x | `cargo install tauri-cli --version "^2"` |
| WebView2 | Any | Pre-installed on Windows 10/11 |

### Build the CLI

```powershell
cargo build -p java-manager-cli --release
# Output: target\release\jdkman.exe
```

### Build the Desktop App (Development)

```powershell
cd java-manager-desktop
npm install
cargo tauri dev
```

### Build the Desktop App (Release)

```powershell
cd java-manager-desktop
npm run build
npm run tauri:build
```

Release artifacts:

| Artifact | Path |
|----------|------|
| Raw `.exe` | `target\release\java-manager-desktop.exe` |
| NSIS installer | `target\release\bundle\nsis\JDK Manager_0.1.0_x64-setup.exe` |
| MSI installer | `target\release\bundle\msi\JDK Manager_0.1.0_x64_en-US.msi` |

### Run Tests

```powershell
# All workspace tests
cargo test

# Core library only
cargo test -p java-manager-core
```

---

## Project Structure

```
jdkman/
├── Cargo.toml                     Workspace root
├── java-manager-core/             Shared Rust library — all business logic
│   └── src/
│       ├── config.rs              Config load/save
│       ├── models.rs              Shared data types
│       ├── errors.rs              Error types
│       ├── java.rs                JDK validation & probing
│       ├── env.rs                 Windows registry integration
│       ├── scan.rs                JDK scanner
│       ├── doctor.rs              Diagnostics engine
│       ├── operations.rs          High-level API
│       └── process.rs             Child process helpers
├── java-manager-cli/              CLI binary (jdkman.exe)
│   └── src/main.rs                Clap command definitions
├── java-manager-desktop/          Tauri 2 desktop application
│   ├── src/                       React + TypeScript frontend
│   ├── src-tauri/                 Rust Tauri backend
│   └── package.json
├── public-web/                    Next.js marketing website
│   └── app/
└── BUILD.md                       Detailed build guide
```

---

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Core library** | Rust, `winreg`, `windows-sys`, `serde` |
| **CLI** | Rust, `clap`, `colored` |
| **Desktop app** | Rust + Tauri 2, React 18, TypeScript, Tailwind CSS, React Router, Lucide icons |
| **Marketing site** | Next.js 16, React 19, Tailwind CSS 4 |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Summary: you are free to use, copy, modify, and distribute this software under the terms of the MIT License.

---

<p align="center">
  <sub>Built for developers who keep more than one Java version alive.</sub>
</p>
