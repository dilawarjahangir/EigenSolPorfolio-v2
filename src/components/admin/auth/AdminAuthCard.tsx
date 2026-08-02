import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./AdminAuth.module.css";

type AdminAuthCardProps = Readonly<{
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}>;

export function AdminAuthCard({
  title,
  description,
  children,
  footer,
}: AdminAuthCardProps) {
  return (
    <main className={styles.screen}>
      <section className={styles.card} aria-labelledby="admin-auth-title">
        <Link className={styles.brand} href="/" aria-label="Return to EigenSol home">
          <span className={styles.brandMark} aria-hidden="true">
            <ShieldCheck />
          </span>
          <span>EigenSol Admin</span>
        </Link>
        <p className={styles.eyebrow}>Private workspace</p>
        <h1 className={styles.title} id="admin-auth-title">
          {title}
        </h1>
        <p className={styles.description}>{description}</p>
        {children}
        {footer ? <nav className={styles.footer}>{footer}</nav> : null}
      </section>
    </main>
  );
}
