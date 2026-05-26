import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JDK Manager - Cross-Platform Java Version Management",
  description:
    "Stop fighting JAVA_HOME and PATH. JDK Manager is a cross-platform tool with a Rust CLI and Tauri desktop app for discovering, switching, and validating JDK installations on Windows, macOS, and Linux.",
  keywords: [
    "JDK Manager",
    "Java version manager",
    "cross-platform JDK manager",
    "JAVA_HOME",
    "Java PATH",
    "jdkman CLI",
    "Tauri desktop app",
    "Java version switching",
    "JDK scanner",
  ],
  openGraph: {
    title: "JDK Manager - Cross-Platform Java Version Management",
    description:
      "A Rust CLI and Tauri desktop app that discovers, switches, and validates JDK installations on Windows, macOS, and Linux.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "JDK Manager - Cross-Platform Java Version Management",
    description:
      "Stop fighting JAVA_HOME and PATH. Discover, switch, and validate JDK installations across Windows, macOS, and Linux.",
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} scroll-smooth`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
