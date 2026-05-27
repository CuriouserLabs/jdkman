import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "./components/site-chrome";
import {
  DOWNLOAD_PATH,
  DOWNLOAD_URL,
  GETTING_STARTED_PATH,
  PRIMARY_KEYWORDS,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  absoluteUrl,
} from "./site";

export const metadata: Metadata = {
  title: "JDK Manager for Windows | Java Version Manager",
  description:
    "JDK Manager is a Java version manager for Windows that helps you discover JDKs, switch JAVA_HOME, fix PATH issues, and manage multiple JDK versions with a CLI and desktop app.",
  alternates: {
    canonical: "/",
  },
};

const features = [
  {
    icon: "Scan",
    title: "Discover installed JDKs on Windows",
    body: "Find Adoptium, Corretto, Zulu, BellSoft, GraalVM, Oracle JDK, and other installations without hunting through Program Files or the registry yourself.",
  },
  {
    icon: "Switch",
    title: "Switch JAVA_HOME and PATH safely",
    body: "Use a Rust CLI or desktop UI to activate the right JDK version for the project you are working on, without manual environment-variable edits.",
  },
  {
    icon: "Doctor",
    title: "Fix broken Java environments faster",
    body: "Run diagnostics to see why java, javac, JAVA_HOME, or PATH are wrong and get clear guidance for repairing the setup.",
  },
] as const;

const searchGuides = [
  {
    href: "/guides/switch-java-version-windows",
    title: "How to switch Java versions on Windows",
    body: "A practical guide for moving between Java 8, 11, 17, and 21 without breaking your terminal or build tools.",
  },
  {
    href: "/guides/fix-java-home-path-windows",
    title: "How to fix JAVA_HOME and PATH on Windows",
    body: "Learn the clean mental model for Java environment variables and how to repair mismatches when java resolves incorrectly.",
  },
  {
    href: "/guides/manage-multiple-jdks-windows",
    title: "How to manage multiple JDKs on Windows",
    body: "See the workflow for keeping legacy and modern Java projects side by side on one Windows machine.",
  },
] as const;

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Windows",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  downloadUrl: DOWNLOAD_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  brand: {
    "@type": "Brand",
    name: SITE_NAME,
  },
  author: {
    "@type": "Organization",
    name: SITE_NAME,
    url: REPO_URL,
  },
  keywords: PRIMARY_KEYWORDS.join(", "),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([softwareApplicationJsonLd, websiteJsonLd]),
        }}
      />

      <PageShell
        eyebrow={SITE_TAGLINE}
        title="A Java version manager for Windows that keeps JAVA_HOME under control."
        intro="JDK Manager helps you discover installed JDKs, switch Java versions on Windows, fix PATH and JAVA_HOME issues, and manage multiple JDK versions with a Rust CLI and desktop app."
      >
        <section className="container-narrow py-20 md:py-28">
          <div className="max-w-3xl space-y-6">
            <p className="eyebrow eyebrow-brand">Why developers search for JDK Manager</p>
            <h2 className="text-3xl font-bold tracking-[-0.03em] md:text-4xl">
              Stop editing PATH by hand every time you change Java projects.
            </h2>
            <p className="text-base leading-relaxed text-[var(--muted-2)] md:text-lg">
              If you need a Java version manager for Windows, you usually want one of three things:
              a fast way to switch Java versions, a clean way to manage multiple JDKs, or a safer way
              to fix JAVA_HOME and PATH when they drift out of sync. JDK Manager is built specifically
              for those workflows.
            </p>
          </div>

          <div id="features" className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="surface-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-dark py-20 md:py-28">
          <div className="container-narrow grid gap-12 lg:grid-cols-[0.48fr_0.52fr]">
            <div>
              <p className="eyebrow eyebrow-light">Download and install</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
                Download the Windows installer, then choose CLI or desktop workflow.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/55 md:text-lg">
                The installer gives you the desktop app, optional CLI access, and a cleaner way to manage
                JDKs than manual registry edits or environment-variable copy/paste.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/download" className="btn btn-primary">
                  Open download page
                </Link>
                <Link href={DOWNLOAD_PATH} className="btn btn-ghost">
                  Direct MSI download
                </Link>
              </div>
            </div>

            <div className="terminal-frame">
              <div className="terminal-titlebar">
                <span className="terminal-dot" />
                <span className="terminal-dot" />
                <span className="terminal-dot" />
                <span className="terminal-title">Windows JDK workflow</span>
              </div>
              <div className="terminal-body space-y-3">
                <div className="terminal-line">
                  <span className="prompt">$</span>
                  <code>jdkman scan --auto-add</code>
                </div>
                <pre className="terminal-output whitespace-pre-wrap">
                  Found existing JDKs and imported them as aliases for safer switching.
                </pre>
                <div className="terminal-line">
                  <span className="prompt">$</span>
                  <code>jdkman use java21</code>
                </div>
                <pre className="terminal-output whitespace-pre-wrap">
                  Updates JAVA_HOME and PATH for the active Windows user environment.
                </pre>
                <div className="terminal-line">
                  <span className="prompt">$</span>
                  <code>jdkman doctor</code>
                </div>
                <pre className="terminal-output whitespace-pre-wrap">
                  Explains what is wrong when java, javac, PATH, or JAVA_HOME are mismatched.
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="container-narrow py-20 md:py-28">
          <div className="max-w-3xl space-y-5">
            <p className="eyebrow eyebrow-brand">Search guides</p>
            <h2 className="text-3xl font-bold tracking-[-0.03em] md:text-4xl">
              Learn how to switch Java versions and manage multiple JDKs on Windows.
            </h2>
            <p className="text-base leading-relaxed text-[var(--muted-2)] md:text-lg">
              These pages target the most common Windows Java setup problems and connect them back to the
              installer, CLI, and desktop app.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {searchGuides.map((guide) => (
              <article key={guide.href} className="surface-card-flat">
                <h3 className="text-lg font-semibold">{guide.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-2)]">{guide.body}</p>
                <Link href={guide.href} className="mt-5 inline-flex text-sm font-semibold text-[var(--brand)]">
                  Read guide
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[var(--page-bg-2)] py-20 md:py-28">
          <div className="container-narrow">
            <div className="cta-panel relative z-10 text-center">
              <p className="eyebrow eyebrow-light">Start with the right page</p>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                Download JDK Manager, open getting started, or inspect the GitHub source.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/55">
                Whether you searched for a JDK manager for Windows, a way to switch JAVA_HOME, or a cleaner
                path setup for multiple Java projects, these are the most useful next steps.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/download" className="btn btn-primary">
                  Download JDK Manager
                </Link>
                <Link href={GETTING_STARTED_PATH} className="btn btn-ghost">
                  Open getting started
                </Link>
                <Link href={REPO_URL} className="btn btn-ghost">
                  View on GitHub
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PageShell>
    </>
  );
}
