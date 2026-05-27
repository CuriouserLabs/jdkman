import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../components/site-chrome";
import { DOWNLOAD_PATH, absoluteUrl } from "../../site";

export const metadata: Metadata = {
  title: "How to Manage Multiple JDKs on Windows",
  description:
    "Manage multiple JDK versions on Windows with a cleaner alias-based workflow for legacy and modern Java projects.",
  alternates: {
    canonical: "/guides/manage-multiple-jdks-windows",
  },
  openGraph: {
    url: absoluteUrl("/guides/manage-multiple-jdks-windows"),
  },
};

export default function ManageMultipleJdksWindowsPage() {
  return (
    <PageShell
      eyebrow="Guide"
      title="How to manage multiple JDKs on Windows."
      intro="If you support old and new Java projects at the same time, the goal is not just switching versions — it is doing so predictably."
    >
      <section className="container-narrow py-20 md:py-28">
        <div className="surface-card">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">A clean model for multiple JDKs</h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted-2)]">
            Keep each JDK installation as-is, assign a short alias to each one, and activate only one at a time.
            This prevents PATH clutter and makes it easy to move between Java 8, Java 11, Java 17, and Java 21 workflows.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="surface-card-flat">
              <h3 className="text-lg font-semibold">Legacy projects</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
                Keep Java 8 or 11 available without letting them override newer projects accidentally.
              </p>
            </div>
            <div className="surface-card-flat">
              <h3 className="text-lg font-semibold">Modern projects</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
                Switch to Java 17 or 21 when needed without hand-editing environment variables every time.
              </p>
            </div>
            <div className="surface-card-flat">
              <h3 className="text-lg font-semibold">Shared machine safety</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
                Reduce accidental cross-project breakage by keeping the active JDK explicit and visible.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={DOWNLOAD_PATH} className="btn btn-primary">
              Download JDK Manager
            </Link>
            <Link href="/guides/switch-java-version-windows" className="btn btn-ghost-dark">
              Learn to switch versions
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
