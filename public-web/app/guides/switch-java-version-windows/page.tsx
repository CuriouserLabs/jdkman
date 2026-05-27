import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../components/site-chrome";
import { DOWNLOAD_PATH, absoluteUrl } from "../../site";

export const metadata: Metadata = {
  title: "How to Switch Java Versions on Windows",
  description:
    "Learn how to switch Java versions on Windows safely, keep JAVA_HOME correct, and move between Java 8, 11, 17, and 21 without manual PATH edits.",
  alternates: {
    canonical: "/guides/switch-java-version-windows",
  },
  openGraph: {
    url: absoluteUrl("/guides/switch-java-version-windows"),
  },
};

export default function SwitchJavaVersionWindowsPage() {
  return (
    <PageShell
      eyebrow="Guide"
      title="How to switch Java versions on Windows without breaking PATH."
      intro="The safe mental model is simple: one active JDK, one active JAVA_HOME, and one winning Java bin path at a time."
    >
      <section className="container-narrow py-20 md:py-28">
        <div className="surface-card">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">Core idea</h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted-2)]">
            Most Java switching problems on Windows happen because multiple JDK bin folders compete in PATH
            or JAVA_HOME still points to an old install. JDK Manager centralizes that change so you can move
            between Java 8, 11, 17, and 21 more safely.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="surface-card-flat">
              <h3 className="text-lg font-semibold">What to do</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
                Install the app, discover your JDKs, assign aliases, then activate the version you need for the
                project you are working on.
              </p>
            </div>
            <div className="surface-card-flat">
              <h3 className="text-lg font-semibold">What to avoid</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">
                Avoid stacking multiple Java bin folders in PATH and avoid manually editing environment variables
                differently in several shells.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={DOWNLOAD_PATH} className="btn btn-primary">
              Download JDK Manager
            </Link>
            <Link href="/guides/manage-multiple-jdks-windows" className="btn btn-ghost-dark">
              Manage multiple JDKs
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
