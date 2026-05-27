import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../components/site-chrome";
import { DOWNLOAD_PATH, absoluteUrl } from "../../site";

export const metadata: Metadata = {
  title: "How to Fix JAVA_HOME and PATH on Windows",
  description:
    "Fix JAVA_HOME and PATH on Windows by understanding which JDK should be active and removing conflicting Java paths cleanly.",
  alternates: {
    canonical: "/guides/fix-java-home-path-windows",
  },
  openGraph: {
    url: absoluteUrl("/guides/fix-java-home-path-windows"),
  },
};

export default function FixJavaHomePathWindowsPage() {
  return (
    <PageShell
      eyebrow="Guide"
      title="How to fix JAVA_HOME and PATH on Windows."
      intro="If java points to the wrong version or javac is missing, your environment usually has conflicting state between PATH and JAVA_HOME."
    >
      <section className="container-narrow py-20 md:py-28">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="surface-card-flat">
            <h2 className="text-lg font-semibold">Symptom</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
              `java -version` shows one JDK while `JAVA_HOME` points somewhere else, or `javac` is not found.
            </p>
          </div>
          <div className="surface-card-flat">
            <h2 className="text-lg font-semibold">Cause</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
              Old Java bin folders remain in PATH, or JAVA_HOME still targets an outdated installation.
            </p>
          </div>
          <div className="surface-card-flat">
            <h2 className="text-lg font-semibold">Fix</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
              Use one managed source of truth for the active JDK and let the tool rewrite the user environment consistently.
            </p>
          </div>
        </div>

        <div className="mt-10 surface-card">
          <h3 className="text-2xl font-bold tracking-[-0.03em]">Practical workflow</h3>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted-2)]">
            Install JDK Manager, scan for JDKs, select the intended version, then open a new terminal so the updated
            environment is picked up cleanly. If you need the fix in the current shell, use the CLI export workflow.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={DOWNLOAD_PATH} className="btn btn-primary">
              Download JDK Manager
            </Link>
            <Link href="/getting-started" className="btn btn-ghost-dark">
              Open getting started
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
