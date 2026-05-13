/* ─── Data ────────────────────────────────────────────────────────────────── */

import Image from "next/image";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "CLI", href: "#cli" },
  { label: "Desktop App", href: "#desktop" },
  { label: "Use Cases", href: "#audience" },
] as const;

const FEATURES = [
  {
    icon: "🔍",
    title: "Auto-discover JDKs",
    body: "Scans the Windows registry, JAVA_HOME, and common vendor directories — Adoptium, Corretto, Zulu, BellSoft, GraalVM, SapMachine — so you never manually hunt for installs again.",
  },
  {
    icon: "🏷️",
    title: "Alias-based switching",
    body: "Name each JDK however you like. Switch the active version with one command or one click, and JAVA_HOME plus PATH update automatically.",
  },
  {
    icon: "🩺",
    title: "Built-in diagnostics",
    body: "The doctor command checks config health, alias validity, PATH integrity, and whether java and javac resolve correctly — with fix suggestions.",
  },
  {
    icon: "📋",
    title: "Environment visibility",
    body: "See the active alias, JAVA_HOME value, java location in PATH, and full java -version output at a glance from the CLI or desktop dashboard.",
  },
  {
    icon: "📥",
    title: "Import existing JAVA_HOME",
    body: "Already have JAVA_HOME set? Import it directly into managed aliases without re-configuring anything.",
  },
  {
    icon: "⚡",
    title: "Session export commands",
    body: "Need changes in the current terminal? export-shell emits ready-to-paste PowerShell or CMD commands for immediate session updates.",
  },
] as const;

const CLI_BLOCKS = [
  {
    label: "Discover installed JDKs",
    lines: [
      { prompt: "$", cmd: "jdkman scan --auto-add" },
      { output: 'Found 4 JDK(s):\n  [new] C:\\Program Files\\Eclipse Adoptium\\jdk-21 — Adoptium 21.0.3\n    ✔ Added as \'adoptium-21\'\n  [new] C:\\Program Files\\Amazon Corretto\\jdk17 — Corretto 17.0.11\n    ✔ Added as \'corretto-17\'' },
    ],
  },
  {
    label: "List and switch",
    lines: [
      { prompt: "$", cmd: "jdkman list" },
      { output: "▶ adoptium-21   21.0.3   Adoptium   C:\\Program Files\\Eclipse Adoptium\\jdk-21\n  corretto-17   17.0.11  Corretto   C:\\Program Files\\Amazon Corretto\\jdk17" },
      { prompt: "$", cmd: "jdkman use corretto-17" },
      { output: "✔ Active version : corretto-17\n  JAVA_HOME      : C:\\Program Files\\Amazon Corretto\\jdk17\nℹ PATH and JAVA_HOME updated in user environment (HKCU)." },
    ],
  },
  {
    label: "Diagnose problems",
    lines: [
      { prompt: "$", cmd: "jdkman doctor" },
      { output: "✔ Config file           Config file exists and is readable\n✔ Active alias          \'corretto-17\' is valid and path exists\n⚠ System environment    Not updated — run as Administrator" },
    ],
  },
  {
    label: "Current session export",
    lines: [
      { prompt: "$", cmd: "jdkman export-shell corretto-17 --shell powershell" },
      { output: "$env:JAVA_HOME = 'C:\\Program Files\\Amazon Corretto\\jdk17'\n$env:PATH = 'C:\\Program Files\\Amazon Corretto\\jdk17\\bin;' + $env:PATH" },
    ],
  },
] as const;

const DESKTOP_PAGES = [
  { name: "Dashboard", desc: "Active alias, JAVA_HOME, PATH status, and java -version output at a glance." },
  { name: "Versions", desc: "Add, verify, open folder, remove, and one-click activate any managed JDK." },
  { name: "Scan", desc: "Search the Windows registry and common vendor install locations for JDKs." },
  { name: "Diagnostics", desc: "Warnings, errors, and guided fix suggestions for your Java environment." },
  { name: "Settings", desc: "Config file access, import existing JAVA_HOME, and app preferences." },
] as const;

const AUDIENCES = [
  {
    title: "Project switching",
    desc: "Move between legacy and modern codebases — Java 8 to 21 — without manually editing environment variables every time.",
    icon: "🔄",
  },
  {
    title: "Team onboarding",
    desc: "Give teammates one predictable workflow for finding, naming, and activating the correct JDK across projects.",
    icon: "👥",
  },
  {
    title: "Broken env recovery",
    desc: "Use diagnostics to understand why java resolves incorrectly or why JAVA_HOME points at a missing install.",
    icon: "🔧",
  },
] as const;

const VENDORS = ["Adoptium", "Corretto", "Zulu", "BellSoft", "GraalVM", "SapMachine", "Oracle JDK"] as const;

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        <div className="container-narrow relative z-10">
          {/* Nav */}
          <header className="flex items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10">
                <Image
                  src="/app-logo.png"
                  alt="JDK Manager"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                  priority
                />
              </span>
              <span className="text-sm font-semibold tracking-wide text-white/90">JDK Manager</span>
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className="nav-link">{n.label}</a>
              ))}
              <a href="#download" className="btn btn-primary text-sm" style={{ minHeight: "2.4rem", padding: "0 1.1rem", fontSize: "0.82rem" }}>
                Get Started
              </a>
            </nav>
            <a href="#download" className="btn btn-primary md:hidden" style={{ minHeight: "2.4rem", padding: "0 1rem", fontSize: "0.82rem" }}>
              Download
            </a>
          </header>

          {/* Hero content */}
          <div className="pb-16 pt-12 md:pb-24 md:pt-20">
            <div className="max-w-3xl space-y-6 animate-fade-up">
              <p className="eyebrow eyebrow-light">Windows-first Java version manager</p>
              <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-[4.2rem]">
                Switch Java versions<br className="hidden sm:inline" /> without the{" "}
                <span className="gradient-text">environment&#8209;variable&nbsp;pain.</span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/55 md:text-lg md:leading-8">
                JDK Manager discovers installed JDKs, lets you switch between them with a single command or click, validates broken setups, and keeps{" "}
                <code className="inline-code-light">JAVA_HOME</code> and{" "}
                <code className="inline-code-light">PATH</code> under control. CLI + desktop app. Built in Rust.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <a href="/JDK%20Manager_0.1.0_x64_en-US.msi" download className="btn btn-primary">Download Preview</a>
                <a href="#cli" className="btn btn-ghost">See the CLI →</a>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-12 grid gap-3 sm:grid-cols-3 animate-fade-up delay-2">
              <Stat value="CLI + Desktop" label="Two interfaces, one JDK inventory" />
              <Stat value="Windows-first" label="Registry-aware scanning and env updates" />
              <Stat value="Doctor built in" label="Diagnose PATH, JAVA_HOME, alias issues" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Vendor bar ────────────────────────────────────────────────── */}
      <div className="border-b border-[var(--panel-border)] bg-[var(--page-bg)] py-5">
        <div className="container-narrow flex flex-wrap items-center justify-center gap-2.5">
          <span className="mr-2 text-xs font-medium text-[var(--muted)]">Detects:</span>
          {VENDORS.map((v) => (
            <span key={v} className="vendor-chip"><span className="dot" />{v}</span>
          ))}
        </div>
      </div>

      {/* ── Why it exists ─────────────────────────────────────────────── */}
      <section className="container-narrow py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow eyebrow-brand">Why it exists</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            A cleaner way to manage multiple JDKs on Windows.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted-2)] md:text-lg">
            Managing Java versions on Windows means editing <code className="inline-code">JAVA_HOME</code>, fighting <code className="inline-code">PATH</code> ordering, and guessing which JDK is actually active.
            JDK Manager replaces that with named aliases, automatic discovery, one-step switching, and built-in diagnostics.
          </p>
        </div>

        <div className="mt-12 grid gap-2 md:grid-cols-2">
          <div className="surface-card-flat flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)] text-lg text-white">⌨</span>
            <div>
              <h3 className="text-lg font-semibold">Rust CLI</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted-2)]">
                The <code className="inline-code">jdkman</code> binary is fast, scriptable, and designed for terminal workflows. Scan, list, switch, diagnose — all in one tool.
              </p>
            </div>
          </div>
          <div className="surface-card-flat flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-lg text-white">🖥</span>
            <div>
              <h3 className="text-lg font-semibold">Tauri Desktop App</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--muted-2)]">
                A native Windows app built with Tauri and React for developers who want visual confirmation before switching versions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="bg-[var(--page-bg-2)] py-20 md:py-28">
        <div className="container-narrow">
          <p className="eyebrow eyebrow-brand">Features</p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            Everything you need to wrangle Java on Windows.
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

      {/* ── CLI showcase ──────────────────────────────────────────────── */}
      <section id="cli" className="section-dark py-20 md:py-28">
        <div className="container-narrow">
          <div className="grid items-start gap-12 lg:grid-cols-[0.42fr_0.58fr]">
            <div>
              <p className="eyebrow eyebrow-light">CLI</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
                Sharp, practical terminal workflow.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/50 md:text-lg">
                The Rust CLI exposes every capability: scan common install roots, list aliases, switch active versions, run diagnostics, and print session export commands.
              </p>
              <div className="mt-6">
                <a href="#download" className="btn btn-ghost">Install the CLI →</a>
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
                    {block.lines.map((line, i) => (
                      "cmd" in line ? (
                        <div key={i} className="terminal-line">
                          <span className="prompt">{line.prompt}</span>
                          <code>{line.cmd}</code>
                        </div>
                      ) : (
                        <pre key={i} className="terminal-output whitespace-pre-wrap">{line.output}</pre>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Desktop app ───────────────────────────────────────────────── */}
      <section id="desktop" className="container-narrow py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow eyebrow-brand">Desktop app</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            A visual dashboard for the same workflow.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted-2)] md:text-lg">
            The Tauri app wraps the same capabilities in a friendlier experience. See your environment at a glance, scan for JDKs visually, and switch versions with one click.
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

        {/* Product details */}
        <div className="mx-auto mt-8 max-w-4xl grid gap-4 md:grid-cols-2">
          <div className="surface-card-flat">
            <h3 className="text-sm font-semibold text-[var(--brand)]">How switching works</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
              Activating a JDK updates <code className="inline-code">JAVA_HOME</code> and <code className="inline-code">PATH</code> in the Windows user environment (HKCU). System-wide changes (HKLM) require Administrator access — the app explains this clearly.
            </p>
          </div>
          <div className="surface-card-flat">
            <h3 className="text-sm font-semibold text-[var(--accent)]">Terminal caveat</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
              Already-open terminals won&apos;t pick up environment changes until reopened. Use <code className="inline-code">jdkman export-shell</code> to apply changes to the current session immediately.
            </p>
          </div>
        </div>
      </section>

      {/* ── Audience / use cases ───────────────────────────────────────── */}
      <section id="audience" className="section-dark-alt py-20 md:py-28">
        <div className="container-narrow">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow eyebrow-light">Who it&apos;s for</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
              Made for developers who keep more than one Java version alive.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/50 md:text-lg">
              Backend teams, Android developers, consultants jumping between JDK 8, 11, 17, and 21 across different projects.
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

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section id="download" className="container-narrow py-20 md:py-28">
        <div className="cta-panel relative z-10 text-center">
          <p className="eyebrow eyebrow-light">Get started</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
            Take control of your Java environment on Windows.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/50">
            Download the CLI, try the desktop app, or browse the source on GitHub. Free and open source.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/JDK%20Manager_0.1.0_x64_en-US.msi" download className="btn btn-primary">Download for Windows</a>
            <a href="#" className="btn btn-ghost">View on GitHub</a>
            <a href="#" className="btn btn-ghost">Read the Docs</a>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="footer py-8">
        <div className="container-narrow flex flex-col items-center justify-between gap-4 text-sm text-[var(--muted)] md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--brand)] text-[0.65rem] font-bold text-white">J</span>
            <span className="font-medium text-[var(--ink-soft)]">JDK Manager</span>
          </div>
          <p>Windows-first Java version management. Built with Rust.</p>
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-[var(--ink)]">GitHub</a>
            <a href="#" className="transition-colors hover:text-[var(--ink)]">Docs</a>
            <a href="#" className="transition-colors hover:text-[var(--ink)]">Releases</a>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─── Subcomponents ───────────────────────────────────────────────────────── */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-pill">
      <p className="text-base font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/40">{label}</p>
    </div>
  );
}
