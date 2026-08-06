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
    images: [
      {
        url: absoluteUrl(seoConfig.defaultImage),
        alt: "EigenSol product engineering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EigenSol | Custom Software, Web, Mobile, AI & Cloud",
    description: seoConfig.description,
    images: [absoluteUrl(seoConfig.defaultImage)],
  },
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    shortcut: ["/favicon.ico"],
    apple: ["/apple-icon"],
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "En3o_4RcNFokDNi5VyMmei9Xg684d0x3EDRTuvAqLeM",
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

const googleTagManagerScript = `
  (function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),
        dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;
    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-N599ZRVQ');
`;

const googleAnalyticsScript = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-8G3E6QSGNY');
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
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {googleTagManagerScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N599ZRVQ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8G3E6QSGNY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {googleAnalyticsScript}
        </Script>
        <RouteScrollReset />
        {children}
      </body>
    </html>
  );
}
