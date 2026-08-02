import type { Metadata } from "next";
import theme from "@/components/admin/AdminTheme.module.css";

export const metadata: Metadata = {
  title: {
    default: "EigenSol CMS",
    template: "%s | EigenSol CMS",
  },
  description: "Private EigenSol content administration.",
  applicationName: null,
  authors: null,
  creator: null,
  publisher: null,
  category: null,
  alternates: null,
  openGraph: null,
  twitter: null,
  icons: null,
  manifest: null,
  verification: {},
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className={theme.root}>{children}</div>;
}
