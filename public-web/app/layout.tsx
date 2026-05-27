import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { PRIMARY_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "./site";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JDK Manager for Windows | Java Version Manager",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: PRIMARY_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JDK Manager for Windows | Java Version Manager",
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl("/app-logo.png"),
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JDK Manager for Windows | Java Version Manager",
    description: SITE_DESCRIPTION,
    images: [absoluteUrl("/app-logo.png")],
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
