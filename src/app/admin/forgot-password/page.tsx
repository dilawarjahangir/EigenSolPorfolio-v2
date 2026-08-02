import type { Metadata } from "next";
import Link from "next/link";
import { AdminAuthCard } from "@/components/admin/auth/AdminAuthCard";
import { AdminForgotPasswordForm } from "@/components/admin/auth/AdminForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset admin password",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminForgotPasswordPage() {
  return (
    <AdminAuthCard
      title="Reset your password"
      description="Enter the owner account email. A time-limited reset link will be delivered through the configured Zoho mail account."
      footer={<Link href="/admin/login">Return to sign in</Link>}
    >
      <AdminForgotPasswordForm />
    </AdminAuthCard>
  );
}
