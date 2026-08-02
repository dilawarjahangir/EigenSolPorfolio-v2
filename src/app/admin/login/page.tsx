import type { Metadata } from "next";
import Link from "next/link";
import { AdminAuthCard } from "@/components/admin/auth/AdminAuthCard";
import { AdminLoginForm } from "@/components/admin/auth/AdminLoginForm";
import styles from "@/components/admin/auth/AdminAuth.module.css";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

type AdminLoginPageProps = Readonly<{
  searchParams: Promise<{ "password-reset"?: string }>;
}>;

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const query = await searchParams;

  return (
    <AdminAuthCard
      title="Sign in"
      description="Enter the private owner account credentials. Two-factor verification is required after your password."
      footer={
        <>
          <Link href="/admin/forgot-password">Forgot password?</Link>
          <Link href="/">Return to website</Link>
        </>
      }
    >
      {query["password-reset"] === "complete" ? (
        <p className={styles.status} role="status">
          Your password was updated. Sign in with the new password.
        </p>
      ) : null}
      <AdminLoginForm />
    </AdminAuthCard>
  );
}
