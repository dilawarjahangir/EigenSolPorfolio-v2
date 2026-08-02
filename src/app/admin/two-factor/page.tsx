import type { Metadata } from "next";
import Link from "next/link";
import { AdminAuthCard } from "@/components/admin/auth/AdminAuthCard";
import { AdminTwoFactorForm } from "@/components/admin/auth/AdminTwoFactorForm";

export const metadata: Metadata = {
  title: "Two-factor verification",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminTwoFactorPage() {
  return (
    <AdminAuthCard
      title="Verify it’s you"
      description="Enter the current code from your authenticator app. Devices are never remembered for this admin account."
      footer={<Link href="/admin/login">Restart sign in</Link>}
    >
      <AdminTwoFactorForm />
    </AdminAuthCard>
  );
}
