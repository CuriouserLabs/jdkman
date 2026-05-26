# JDK Manager Build Guide

## Supported platforms

- Windows 10/11
- macOS
- Linux

## Tooling

| Tool | Version |
|------|---------|
| Rust | 1.77+ |
| Node.js | 18+ |
| npm | 9+ |
| Tauri CLI | 2.x |

Install Tauri CLI:

```bash
cargo install tauri-cli --version "^2"
```

## Platform prerequisites

### Windows

- WebView2 runtime

### macOS

- Xcode Command Line Tools

### Linux

You need the usual Tauri/WebKitGTK dependencies. For Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf
```

## CLI build

```bash
cargo build -p java-manager-cli --release
```

Outputs:

- Windows: `target\release\jdkman.exe`
- macOS/Linux: `target/release/jdkman`

## Desktop development

```bash
cd java-manager-desktop
npm install
npm run tauri:dev
```

The prepare script copies the CLI binary into `src-tauri/resources/` before packaging.

## Desktop release builds

From `java-manager-desktop/`:

```bash
npm run build
npm run tauri:build
```

Platform-specific bundle helpers:

```bash
npm run tauri:bundle:windows
npm run tauri:bundle:macos
npm run tauri:bundle:linux
```

Expected first-release artifacts:

- Windows: NSIS `.exe`, MSI `.msi`
- macOS: `.app`, `.dmg`
- Linux: AppImage, `.deb`

## Tests and checks

```bash
# Full workspace
cargo test

# Core only
cargo test -p java-manager-core

# CLI only
cargo test -p java-manager-cli

# Desktop frontend
cd java-manager-desktop
npm run build
```

## Activation model

### Windows

`jdkman use <alias>` updates the environment immediately for future processes.

### macOS/Linux

`jdkman use <alias>` selects the alias in config. Activate it in the current shell with:

```bash
jdkman export-shell java21 --shell bash
```

Examples:

```bash
eval "$(jdkman export-shell java21 --shell bash)"
```

```fish
jdkman export-shell java21 --shell fish | source
```

## CI expectations

The repo CI should verify:

- `cargo test`
- `cargo build -p java-manager-cli --release`
- desktop frontend build
- desktop Rust build on Windows, macOS, and Linux

## Out of scope

- Automatic shell profile editing on macOS/Linux
- macOS notarization/signing setup
- Linux package signing
