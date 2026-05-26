import Image from "next/image";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "CLI", href: "#cli" },
  { label: "Desktop App", href: "#desktop" },
  { label: "Downloads", href: "#download" },
] as const;

const RELEASES_URL = "https://github.com/PrabathMadushan/jdkman/releases";
const REPO_URL = "https://github.com/PrabathMadushan/jdkman";
const DOCS_URL = "https://github.com/PrabathMadushan/jdkman/blob/main/README.md";

const FEATURES = [
  {
    icon: "🔍",
    title: "Cross-platform JDK discovery",
    body: "Find installed JDKs from common locations on Windows, macOS, and Linux, plus JAVA_HOME when it already exists.",
  },
  {
    icon: "🏷️",
    title: "Alias-based switching",
    body: "Use simple names like java8, java17, or graal21 and switch the active version from the CLI or desktop app.",
  },
  {
    icon: "🩺",
    title: "Built-in diagnostics",
    body: "Check config health, invalid JDK paths, JAVA_HOME mismatches, and PATH resolution problems with one doctor command.",
  },
  {
    icon: "📦",
    title: "Shared CLI and desktop config",
    body: "The Rust CLI and Tauri desktop app read the same config, so your aliases stay in sync across both interfaces.",
  },
  {
    icon: "⚡",
    title: "Shell exports for every session",
    body: "Export ready-to-run commands for PowerShell, CMD, bash, zsh, and fish when you need the current shell updated immediately.",
  },
  {
    icon: "📥",
    title: "Multi-OS releases",
    body: "Ship installers and bundles for Windows, macOS, and Linux, plus raw CLI binaries for terminal-first users.",
  },
] as const;

const CLI_BLOCKS = [
  {
    label: "Discover and add JDKs",
    lines: [
      { prompt: "$", cmd: "jdkman scan --auto-add" },
      {
        output:
          "Found 3 JDK(s):\n  [new] /usr/lib/jvm/temurin-21 - Eclipse Adoptium 21.0.3\n    Added as 'java21'\n  [new] /Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home - Eclipse Adoptium 17.0.11",
      },
    ],
  },
  {
    label: "Switch by alias",
    lines: [
      { prompt: "$", cmd: "jdkman use java21" },
      {
        output:
          "Active version : java21\nJAVA_HOME      : /usr/lib/jvm/temurin-21\nSelected 'java21' for Linux.\nApply it in the current shell with 'jdkman export-shell java21 --shell bash'.",
      },
    ],
  },
  {
    label: "Apply to the current shell",
    lines: [
      { prompt: "$", cmd: "jdkman export-shell java21 --shell zsh" },
      {
        output:
          "export JAVA_HOME='/usr/lib/jvm/temurin-21'\nexport PATH='/usr/lib/jvm/temurin-21/bin':\"$PATH\"",
      },
    ],
  },
  {
    label: "Diagnose problems",
    lines: [
      { prompt: "$", cmd: "jdkman doctor" },
      {
        output:
          "Config file loaded successfully\njava in PATH found\nJAVA_HOME mismatch warning with selected alias guidance",
      },
    ],
  },
] as const;

const DESKTOP_PAGES = [
  { name: "Dashboard", desc: "See the active alias, JAVA_HOME, PATH state, and java -version output instantly." },
  { name: "Versions", desc: "Add, verify, remove, and switch JDK aliases from one place." },
  { name: "Scan", desc: "Search common JDK install locations for the current platform." },
  { name: "Diagnostics", desc: "Surface config issues, broken paths, and shell activation problems." },
  { name: "Settings", desc: "Review config paths, import JAVA_HOME, and understand platform-specific behavior." },
] as const;

const AUDIENCES = [
  {
    title: "Multi-project developers",
    desc: "Jump between Java 8, 11, 17, and 21 across client work, legacy systems, and modern services without manual env edits.",
    icon: "🔁",
  },
  {
    title: "Teams shipping on every OS",
    desc: "Use one shared workflow for Windows, macOS, and Linux instead of teaching three different JDK switching habits.",
    icon: "🌍",
  },
  {
    title: "People fixing broken setups",
    desc: "Use diagnostics to understand why java resolves incorrectly, why JAVA_HOME is stale, or why a JDK path is invalid.",
    icon: "🛠",
  },
] as const;

const DOWNLOADS = [
  {
    os: "Windows",
    formats: "MSI, NSIS setup, raw CLI",
    body: "Installer-friendly release path for desktop users, plus the CLI binary for terminal workflows.",
    href: RELEASES_URL,
    cta: "Open Windows Releases",
  },
  {
    os: "macOS",
    formats: "DMG, app bundle, raw CLI",
    body: "Ship desktop bundles for app users and standalone CLI binaries for shell-first workflows.",
    href: RELEASES_URL,
    cta: "Open macOS Releases",
  },
  {
    os: "Linux",
    formats: "AppImage, DEB, raw CLI",
    body: "Offer portable desktop packaging and direct CLI downloads for distro-friendly adoption.",
    href: RELEASES_URL,
    cta: "Open Linux Releases",
  },
] as const;

const VENDORS = [
  "Adoptium",
  "Corretto",
  "Zulu",
  "BellSoft",
  "GraalVM",
  "SapMachine",
  "Oracle JDK",
] as const;

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        <div className="container-narrow relative z-10">
          <header className="flex items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10">
                <Image src="/app-logo.png" alt="JDK Manager" width={32} height={32} className="h-full w-full object-cover" priority />
              </span>
              <span className="text-sm font-semibold tracking-wide text-white/90">JDK Manager</span>
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className="nav-link">
                  {n.label}
                </a>
              ))}
              <a href="#download" className="btn btn-primary text-sm" style={{ minHeight: "2.4rem", padding: "0 1.1rem", fontSize: "0.82rem" }}>
                Downloads
              </a>
            </nav>
            <a href="#download" className="btn btn-primary md:hidden" style={{ minHeight: "2.4rem", padding: "0 1rem", fontSize: "0.82rem" }}>
              Download
            </a>
          </header>

          <div className="pb-16 pt-12 md:pb-24 md:pt-20">
            <div className="max-w-3xl space-y-6 animate-fade-up">
              <p className="eyebrow eyebrow-light">Cross-platform Java version manager</p>
              <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-[4.2rem]">
                Switch Java versions
                <br className="hidden sm:inline" /> without the <span className="gradient-text">environment-variable pain.</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg md:leading-8">
                JDK Manager discovers installed JDKs, lets you switch between them with a single command or click, validates broken setups, and keeps{" "}
                <code className="inline-code-light">JAVA_HOME</code> and <code className="inline-code-light">PATH</code> under control across Windows, macOS, and Linux.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <a href="#download" className="btn btn-primary">
                  Download for Your OS
                </a>
                <a href="#cli" className="btn btn-ghost">
                  See the CLI →
                </a>
              </div>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-3 animate-fade-up delay-2">
              <Stat value="Windows + macOS + Linux" label="One toolchain across all major desktop OSes" />
              <Stat value="CLI + Desktop" label="Two interfaces sharing the same JDK inventory" />
              <Stat value="Shell-aware activation" label="PowerShell, CMD, bash, zsh, and fish support" />
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-[var(--panel-border)] bg-[var(--page-bg)] py-5">
        <div className="container-narrow flex flex-wrap items-center justify-center gap-2.5">
          <span className="mr-2 text-xs font-medium text-[var(--muted)]">Works well with:</span>
          {VENDORS.map((v) => (
            <span key={v} className="vendor-chip">
              <span className="dot" />
              {v}
            </span>
          ))}
        </div>
      </div>

      <section className="container-narrow py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow eyebrow-brand">Why it exists</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            A cleaner way to manage multiple JDKs everywhere.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted-2)] md:text-lg">
            Managing Java versions usually means editing <code className="inline-code">JAVA_HOME</code>, fighting <code className="inline-code">PATH</code> ordering, and guessing which JDK is really active. JDK Manager replaces that with named aliases, automatic discovery, one-step switching, and built-in diagnostics.
          </p>
        </div>

        <div className="mt-12 grid gap-2 md:grid-cols-2">
          <div className="surface-card-flat flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)] text-lg text-white">⌨</span>
            <div>
              <h3 className="text-lg font-semibold">Rust CLI</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted-2)]">
                The <code className="inline-code">jdkman</code> binary is fast, scriptable, and practical for terminal workflows on all supported platforms.
              </p>
            </div>
          </div>
          <div className="surface-card-flat flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-lg text-white">🖥</span>
            <div>
              <h3 className="text-lg font-semibold">Tauri Desktop App</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted-2)]">
                A native desktop layer for developers who want visual discovery, validation, and one-click switching alongside the CLI.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-[var(--page-bg-2)] py-20 md:py-28">
        <div className="container-narrow">
          <p className="eyebrow eyebrow-brand">Features</p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            Everything you need to wrangle Java across your machines.
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="surface-card">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cli" className="section-dark py-20 md:py-28">
        <div className="container-narrow">
          <div className="grid items-start gap-12 lg:grid-cols-[0.42fr_0.58fr]">
            <div>
              <p className="eyebrow eyebrow-light">CLI</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
                Sharp, practical terminal workflow.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/50 md:text-lg">
                Scan common install roots, list aliases, switch active versions, run diagnostics, and export commands for the current shell session.
              </p>
              <div className="mt-6">
                <a href="#download" className="btn btn-ghost">
                  Get the CLI →
                </a>
              </div>
            </div>

            <div className="space-y-4">
              {CLI_BLOCKS.map((block) => (
                <div key={block.label} className="terminal-frame">
                  <div className="terminal-titlebar">
                    <span className="terminal-dot" />
                    <span className="terminal-dot" />
                    <span className="terminal-dot" />
                    <span className="terminal-title">{block.label}</span>
                  </div>
                  <div className="terminal-body space-y-1">
                    {block.lines.map((line, i) =>
                      "cmd" in line ? (
                        <div key={i} className="terminal-line">
                          <span className="prompt">{line.prompt}</span>
                          <code>{line.cmd}</code>
                        </div>
                      ) : (
                        <pre key={i} className="terminal-output whitespace-pre-wrap">
                          {line.output}
                        </pre>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="desktop" className="container-narrow py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow eyebrow-brand">Desktop app</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            A visual dashboard for the same workflow.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted-2)] md:text-lg">
            The Tauri app wraps the same capabilities in a friendlier experience. Discover JDKs visually, inspect your environment, and switch versions with one click.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="app-frame">
            <div className="app-titlebar">
              <span className="terminal-dot" />
              <span className="terminal-dot" />
              <span className="terminal-dot" />
              <span className="ml-2 text-xs font-medium text-[var(--muted)]">JDK Manager</span>
            </div>
            <div className="grid md:grid-cols-[13rem_1fr]">
              <div className="app-sidebar hidden md:block">
                {DESKTOP_PAGES.map((p, i) => (
                  <div key={p.name} className={`app-sidebar-item ${i === 0 ? "active" : ""}`}>
                    <span className="text-sm">{["📊", "📦", "🔍", "🩺", "⚙️"][i]}</span>
                    {p.name}
                  </div>
                ))}
              </div>
              <div className="p-6 md:p-8">
                <div className="space-y-5">
                  {DESKTOP_PAGES.map((p, i) => (
                    <div key={p.name} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--brand)]/10 text-sm">
                        {["📊", "📦", "🔍", "🩺", "⚙️"][i]}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold">{p.name}</h4>
                        <p className="mt-0.5 text-sm text-[var(--muted-2)]">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-4xl grid gap-4 md:grid-cols-2">
          <div className="surface-card-flat">
            <h3 className="text-sm font-semibold text-[var(--brand)]">Platform-aware switching</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
              Windows can update environment state for future processes, while macOS and Linux lean on shell exports for explicit, session-friendly activation.
            </p>
          </div>
          <div className="surface-card-flat">
            <h3 className="text-sm font-semibold text-[var(--accent)]">Current session control</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
              Use <code className="inline-code">jdkman export-shell</code> whenever you want the active alias applied immediately in the terminal you already have open.
            </p>
          </div>
        </div>
      </section>

      <section id="audience" className="section-dark-alt py-20 md:py-28">
        <div className="container-narrow">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow eyebrow-light">Who it&apos;s for</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
              Made for developers who keep more than one Java version alive.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/50 md:text-lg">
              Backend teams, Android developers, consultants, and anyone juggling multiple JDK generations across projects and operating systems.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
            {AUDIENCES.map((a) => (
              <article key={a.title} className="use-case-card">
                <span className="text-2xl">{a.icon}</span>
                <h3 className="mt-4 text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">{a.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="download" className="container-narrow py-20 md:py-28">
        <div className="cta-panel relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow eyebrow-light">Downloads</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
              Download JDK Manager for your platform.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/50">
              Browse the latest GitHub Releases for installers, desktop bundles, and raw CLI binaries. Ship Windows, macOS, and Linux assets from one release pipeline.
            </p>
          </div>

          <div className="download-grid mt-10">
            {DOWNLOADS.map((item) => (
              <article key={item.os} className="download-card">
                <p className="download-os">{item.os}</p>
                <p className="download-formats">{item.formats}</p>
                <p className="download-copy">{item.body}</p>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
                  {item.cta}
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Browse All Releases
            </a>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              View on GitHub
            </a>
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Read the Docs
            </a>
          </div>
        </div>
      </section>

      <footer className="footer py-8">
        <div className="container-narrow flex flex-col items-center justify-between gap-4 text-sm text-[var(--muted)] md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--brand)] text-[0.65rem] font-bold text-white">J</span>
            <span className="font-medium text-[var(--ink-soft)]">JDK Manager</span>
          </div>
          <p>Cross-platform Java version management. Built with Rust.</p>
          <div className="flex gap-4">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--ink)]">
              GitHub
            </a>
            <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--ink)]">
              Releases
            </a>
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[var(--ink)]">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-pill">
      <p className="text-base font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/40">{label}</p>
    </div>
  );
}
