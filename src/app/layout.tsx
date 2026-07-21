import type { Metadata } from "next";
import Script from "next/script";
import RouteScrollReset from "@/components/RouteScrollReset";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://eigensol.com"),
  title: "EigenSol - Custom Software, Web, Mobile, AI & DevOps Solutions",
  description:
    "EigenSol builds resilient software, smarter workflows, and digital products that scale with your business.",
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
