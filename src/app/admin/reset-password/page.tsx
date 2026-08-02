import type { Metadata } from "next";
import Link from "next/link";
import { AdminAuthCard } from "@/components/admin/auth/AdminAuthCard";
import { AdminResetPasswordForm } from "@/components/admin/auth/AdminResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new admin password",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

type AdminResetPasswordPageProps = Readonly<{
  searchParams: Promise<{ token?: string }>;
}>;

export default async function AdminResetPasswordPage({
  searchParams,
}: AdminResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <AdminAuthCard
      title="Choose a new password"
      description="Use at least 12 characters. Completing this reset revokes every active admin session."
      footer={
        <>
          <Link href="/admin/forgot-password">Request another link</Link>
          <Link href="/admin/login">Return to sign in</Link>
        </>
      }
    >
      <AdminResetPasswordForm token={token} />
    </AdminAuthCard>
  );
}
