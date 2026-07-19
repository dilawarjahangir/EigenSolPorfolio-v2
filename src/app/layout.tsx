import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://eigensol.com"),
  title: "EigenSol - Custom Software, Web, Mobile, AI & DevOps Solutions",
  description:
    "EigenSol builds resilient software, smarter workflows, and digital products that scale with your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
