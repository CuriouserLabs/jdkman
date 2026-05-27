import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../components/site-chrome";
import { DOWNLOAD_PATH, REPO_URL, absoluteUrl } from "../site";

export const metadata: Metadata = {
  title: "Getting Started with JDK Manager",
  description:
    "Learn how to install JDK Manager, discover existing JDKs, switch Java versions on Windows, and verify JAVA_HOME and PATH quickly.",
  alternates: {
    canonical: "/getting-started",
  },
  openGraph: {
    url: absoluteUrl("/getting-started"),
  },
};

const steps = [
  "Download the Windows MSI installer and complete setup.",
  "Open JDK Manager and scan your machine for existing JDK installations.",
  "Add aliases or accept suggested names for detected JDKs.",
  "Activate the JDK version you want for the current Windows user environment.",
  "Open a new terminal and verify java, javac, JAVA_HOME, and PATH.",
] as const;

export default function GettingStartedPage() {
  return (
    <PageShell
      eyebrow="Onboarding"
      title="Get started with JDK Manager in a few minutes."
      intro="This page walks through the shortest path from installer download to a working Windows Java version manager setup."
    >
      <section className="container-narrow py-20 md:py-28">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-card">
            <h2 className="text-2xl font-bold tracking-[-0.03em]">First run checklist</h2>
            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="feature-icon">{index + 1}</div>
                  <p className="pt-1 text-sm leading-relaxed text-[var(--muted-2)]">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card-flat">
            <h3 className="text-lg font-semibold">Recommended next links</h3>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--muted-2)]">
              <p>
                If you are installing for the first time, start with the MSI and then move to the
                switch-Java guide when you want to change versions for different projects.
              </p>
              <div className="flex flex-col gap-3">
                <Link href={DOWNLOAD_PATH} className="btn btn-primary">
                  Download installer
                </Link>
                <Link href="/guides/switch-java-version-windows" className="btn btn-ghost-dark">
                  Learn to switch Java versions
                </Link>
                <Link href="/guides/fix-java-home-path-windows" className="btn btn-ghost-dark">
                  Fix JAVA_HOME and PATH
                </Link>
                <Link href={REPO_URL} className="btn btn-ghost-dark">
                  Open GitHub repository
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
