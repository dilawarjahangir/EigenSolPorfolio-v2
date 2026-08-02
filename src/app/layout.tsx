import type { Metadata } from "next";
import Script from "next/script";
import RouteScrollReset from "@/components/RouteScrollReset";
import { absoluteUrl, seoConfig } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.origin),
  title: {
    default: "EigenSol | Custom Software, Web, Mobile, AI & Cloud",
    template: "%s | EigenSol",
  },
  description: seoConfig.description,
  applicationName: seoConfig.name,
  authors: [{ name: seoConfig.name, url: seoConfig.origin }],
  creator: seoConfig.name,
  publisher: seoConfig.name,
  category: "technology",
  alternates: { canonical: seoConfig.origin },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: seoConfig.origin,
    title: "EigenSol | Custom Software, Web, Mobile, AI & Cloud",
    description: seoConfig.description,
    siteName: seoConfig.name,
    locale: seoConfig.locale,
    images: [{ url: absoluteUrl(seoConfig.defaultImage), alt: "EigenSol product engineering" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EigenSol | Custom Software, Web, Mobile, AI & Cloud",
    description: seoConfig.description,
    images: [absoluteUrl(seoConfig.defaultImage)],
  },
  icons: { icon: "/icon.svg", apple: "/apple-icon" },
  manifest: "/manifest.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

const themeScript = `
  (() => {
    try {
      const storedTheme = localStorage.getItem("eigensol-theme");
      const theme = storedTheme === "dark" || storedTheme === "light"
        ? storedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <Script id="eigensol-theme-bootstrap" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <RouteScrollReset />
        {children}
      </body>
    </html>
  );
}
