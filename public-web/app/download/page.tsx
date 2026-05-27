import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../components/site-chrome";
import { DOWNLOAD_PATH, GETTING_STARTED_PATH, REPO_URL, absoluteUrl } from "../site";

export const metadata: Metadata = {
  title: "Download JDK Manager for Windows",
  description:
    "Download JDK Manager for Windows and install the desktop app plus optional CLI tooling for switching Java versions and managing multiple JDKs.",
  alternates: {
    canonical: "/download",
  },
  openGraph: {
    url: absoluteUrl("/download"),
  },
};

export default function DownloadPage() {
  return (
    <PageShell
      eyebrow="Windows installer"
      title="Download JDK Manager for Windows."
      intro="Use the Windows installer to set up the desktop app and optional CLI access for switching Java versions, managing multiple JDKs, and fixing JAVA_HOME and PATH issues."
    >
      <section className="container-narrow py-20 md:py-28">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="surface-card">
            <h2 className="text-2xl font-bold tracking-[-0.03em]">Primary download</h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--muted-2)]">
              The MSI installer is the recommended way to install JDK Manager on Windows. It gives you the
              desktop app and supports optional CLI installation during setup.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={DOWNLOAD_PATH} className="btn btn-primary">
                Download Windows MSI
              </Link>
              <Link href={GETTING_STARTED_PATH} className="btn btn-ghost-dark">
                Read getting started
              </Link>
            </div>
          </div>

          <div className="surface-card-flat">
            <h3 className="text-lg font-semibold">What you get</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--muted-2)]">
              <li>Windows-first JDK discovery and switching</li>
              <li>Desktop app for visual management</li>
              <li>Optional CLI setup for terminal workflows</li>
              <li>Tools for fixing PATH and JAVA_HOME problems</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="surface-card-flat">
            <h3 className="text-sm font-semibold text-[var(--brand)]">Need install steps?</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
              Open the getting-started page for the quickest route from installer to first JDK switch.
            </p>
            <Link href={GETTING_STARTED_PATH} className="mt-4 inline-flex text-sm font-semibold text-[var(--brand)]">
              Open guide
            </Link>
          </div>
          <div className="surface-card-flat">
            <h3 className="text-sm font-semibold text-[var(--accent)]">Need the source?</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
              Browse the Rust CLI, Tauri desktop app, and public website source on GitHub.
            </p>
            <Link href={REPO_URL} className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]">
              View repository
            </Link>
          </div>
          <div className="surface-card-flat">
            <h3 className="text-sm font-semibold text-[var(--brand)]">Need problem-specific help?</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
              Read targeted guides for switching Java versions and fixing environment-variable issues.
            </p>
            <Link href="/guides/switch-java-version-windows" className="mt-4 inline-flex text-sm font-semibold text-[var(--brand)]">
              Read guides
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
