# JDK Manager — Build Guide

## Project layout

```
jdkman/
├── Cargo.toml                    (workspace)
├── java-manager-core/            (shared Rust library — all business logic)
├── java-manager-cli/             (CLI binary: jdkman.exe)
└── java-manager-desktop/         (Tauri desktop app)
    ├── src/                      (Rust Tauri backend)
    ├── ui/                       (React + TypeScript frontend)
    ├── icons/                    (app icons)
    └── capabilities/             (Tauri 2 permission declarations)
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Rust | 1.77+ | https://rustup.rs |
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | bundled with Node |
| Tauri CLI | 2.x | `cargo install tauri-cli --version "^2"` |
| WebView2 | any | pre-installed on Windows 10/11 |

---

## 1 — Build the CLI executable

```powershell
# From workspace root
cargo build -p java-manager-cli --release

# Output:
#   target\release\jdkman.exe
```

The CLI binary is fully self-contained and has no runtime dependencies.

### Install it on your PATH (optional)

```powershell
# Copy to a folder that is already on your PATH, e.g.:
Copy-Item target\release\jdkman.exe "$env:USERPROFILE\bin\jdkman.exe"
```

---

## 2 — Build the Tauri desktop app (development)

```powershell
# Install frontend dependencies (first time only)
cd java-manager-desktop\ui
npm install
cd ..\..

# Run in dev mode (hot-reload UI, auto-reload Rust backend)
cd java-manager-desktop
cargo tauri dev
```

This opens the app window immediately. The Vite dev server runs on port 5173.

---

## 3 — Build the Tauri desktop app (release)

```powershell
cd java-manager-desktop

# Build frontend first
cd ui && npm run build && cd ..

# Build the full Tauri release bundle
cargo tauri build
```

### Output locations

| Artifact | Path |
|----------|------|
| Raw `.exe` | `target\release\java-manager-desktop.exe` |
| NSIS installer | `target\release\bundle\nsis\JDK Manager_0.1.0_x64-setup.exe` |
| MSI installer | `target\release\bundle\msi\JDK Manager_0.1.0_x64_en-US.msi` |

The NSIS installer installs for the **current user** (no admin required).

---

## 4 — Run tests

```powershell
# All workspace tests
cargo test

# Core library only
cargo test -p java-manager-core

# Verbose output
cargo test -p java-manager-core -- --nocapture
```

---

## 5 — CLI reference

```
jdkman list                          List all configured JDKs
jdkman add java21 "C:\path\to\jdk"  Add a JDK with an alias
jdkman use java21                    Activate a version (updates JAVA_HOME + PATH)
jdkman current                       Show active version & JAVA_HOME
jdkman scan                          Find JDKs in common install locations
jdkman scan --auto-add               Find and automatically add all new JDKs
jdkman remove java17                 Remove an alias
jdkman doctor                        Run environment health checks
jdkman export-shell java21           Print PowerShell commands for current session
jdkman export-shell java21 --shell cmd  CMD variant
```

---

## 6 — Adding proper app icons

The placeholder icon is transparent. For production, replace with a real icon:

```powershell
# From workspace root
cargo install tauri-cli --version "^2"  # if not installed

# Generate all icon sizes from a 1024x1024 PNG
cd java-manager-desktop
cargo tauri icon path\to\your-icon-1024.png
```

This generates all required sizes under `java-manager-desktop\icons\`.

---

## 7 — Architecture overview

```
┌─────────────────────────────────────────────┐
│              java-manager-core              │
│                                             │
│  config.rs   — load/save JSON config        │
│  models.rs   — shared data types            │
│  errors.rs   — typed error enum             │
│  java.rs     — JDK validation & probing     │
│  env.rs      — registry reads/writes        │
│  scan.rs     — file system & registry scan  │
│  doctor.rs   — environment diagnostics      │
│  operations.rs — high-level API             │
└───────────┬─────────────────┬───────────────┘
            │                 │
   ┌────────▼────────┐  ┌─────▼──────────────────┐
   │ java-manager-cli│  │  java-manager-desktop   │
   │  (jdkman.exe)   │  │  Rust Tauri backend     │
   │  clap commands  │  │  #[tauri::command] wrappers│
   └─────────────────┘  │  ┌──────────────────┐  │
                        │  │  React + TypeScript│  │
                        │  │  Tailwind CSS UI  │  │
                        │  └──────────────────┘  │
                        └────────────────────────┘
```

### Windows environment changes

When `use` is called:
1. `HKCU\Environment\JAVA_HOME` → written via `winreg`
2. `HKCU\Environment\Path` → all previously-managed Java bin paths removed, new one prepended
3. `WM_SETTINGCHANGE` broadcast via `SendMessageTimeoutW(HWND_BROADCAST, ...)` so new processes pick up the change
4. Config file updated (`%APPDATA%\jdkman\config.json`)

Already-open terminals don't pick up the change — users must open a new terminal, or run `jdkman export-shell <alias>` to apply it inline.

---

## 8 — Config file

Stored at `%APPDATA%\jdkman\config.json`:

```json
{
  "current": "java21",
  "versions": {
    "java17": {
      "path": "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.9.9-hotspot",
      "detected_version": "17.0.9",
      "vendor": "Eclipse Adoptium"
    },
    "java21": {
      "path": "C:\\Program Files\\Microsoft\\jdk-21.0.2.13-hotspot",
      "detected_version": "21.0.2",
      "vendor": "Microsoft"
    }
  }
}
```
