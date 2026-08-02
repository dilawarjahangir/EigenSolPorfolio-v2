import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireOwnerForSetup } from "@/services/auth/AdminAuthService";

export const metadata: Metadata = {
  title: "EigenSol CMS",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const owner = await requireOwnerForSetup();

  return <AdminShell ownerEmail={owner.email}>{children}</AdminShell>;
}
