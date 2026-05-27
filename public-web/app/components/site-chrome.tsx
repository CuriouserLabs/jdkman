import Image from "next/image";
import Link from "next/link";
import { DOWNLOAD_PATH, GETTING_STARTED_PATH, REPO_URL, SITE_NAME } from "../site";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "Download", href: "/download" },
  { label: "Getting Started", href: GETTING_STARTED_PATH },
  { label: "Docs", href: "/guides/manage-multiple-jdks-windows" },
] as const;

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 py-5">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10">
          <Image
            src="/app-logo.png"
            alt={SITE_NAME}
            width={32}
            height={32}
            className="h-full w-full object-cover"
            priority
          />
        </span>
        <span className="text-sm font-semibold tracking-wide text-white/90">{SITE_NAME}</span>
      </Link>

      <nav className="hidden items-center gap-6 md:flex">
        {navItems.map((n) => (
          <Link key={n.href} href={n.href} className="nav-link">
            {n.label}
          </Link>
        ))}
        <Link
          href="/download"
          className="btn btn-primary text-sm"
          style={{ minHeight: "2.4rem", padding: "0 1.1rem", fontSize: "0.82rem" }}
        >
          Download
        </Link>
      </nav>

      <Link
        href="/download"
        className="btn btn-primary md:hidden"
        style={{ minHeight: "2.4rem", padding: "0 1rem", fontSize: "0.82rem" }}
      >
        Download
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer py-8">
      <div className="container-narrow flex flex-col items-center justify-between gap-4 text-sm text-[var(--muted)] md:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded bg-[var(--brand)]">
            <Image src="/app-logo.png" alt={SITE_NAME} width={24} height={24} className="h-full w-full object-cover" />
          </span>
          <span className="font-medium text-[var(--ink-soft)]">{SITE_NAME}</span>
        </div>
        <p>Windows-first Java version management. Built with Rust.</p>
        <div className="flex gap-4">
          <Link href="/download" className="transition-colors hover:text-[var(--ink)]">
            Download
          </Link>
          <Link href={GETTING_STARTED_PATH} className="transition-colors hover:text-[var(--ink)]">
            Getting Started
          </Link>
          <Link href={REPO_URL} className="transition-colors hover:text-[var(--ink)]">
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({
  children,
  title,
  eyebrow,
  intro,
}: {
  children: React.ReactNode;
  title: string;
  eyebrow: string;
  intro: string;
}) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />
        <div className="container-narrow relative z-10">
          <SiteHeader />
          <div className="pb-16 pt-12 md:pb-20 md:pt-16">
            <div className="max-w-3xl space-y-6 animate-fade-up">
              <p className="eyebrow eyebrow-light">{eyebrow}</p>
              <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/60 md:text-lg md:leading-8">
                {intro}
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link href={DOWNLOAD_PATH} className="btn btn-primary">
                  Download for Windows
                </Link>
                <Link href={GETTING_STARTED_PATH} className="btn btn-ghost">
                  Open getting started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {children}
      <SiteFooter />
    </>
  );
}
