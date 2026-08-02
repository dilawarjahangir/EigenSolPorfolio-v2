import { BookOpenText, Database, LockKeyhole, ShieldCheck } from "lucide-react";
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
      <div className={styles.layout}>
        <aside className={styles.intro} aria-label="About the EigenSol content studio">
          <Link className={styles.introBrand} href="/" aria-label="Return to EigenSol home">
            <span className={styles.brandMark} aria-hidden="true">
              <BookOpenText />
            </span>
            <span>
              <strong>EigenSol</strong>
              <small>Content studio</small>
            </span>
          </Link>
          <div className={styles.introCopy}>
            <p>Private publishing workspace</p>
            <h2>Everything behind the story, in one secure place.</h2>
            <span>
              Draft articles, manage media, and moderate conversations without leaving the studio.
            </span>
          </div>
          <ul className={styles.trustList}>
            <li>
              <LockKeyhole aria-hidden="true" />
              <span><strong>Owner-only access</strong>Protected by password and TOTP verification.</span>
            </li>
            <li>
              <Database aria-hidden="true" />
              <span><strong>Durable publishing</strong>Revisions and moderation history stay traceable.</span>
            </li>
          </ul>
        </aside>

        <section className={styles.card} aria-labelledby="admin-auth-title">
          <Link className={styles.cardBrand} href="/" aria-label="Return to EigenSol home">
            <span className={styles.brandMark} aria-hidden="true">
              <ShieldCheck />
            </span>
            <span>EigenSol Admin</span>
          </Link>
          <span className={styles.securityLabel}>
            <LockKeyhole aria-hidden="true" />
            Secure owner access
          </span>
          <p className={styles.eyebrow}>Private workspace</p>
          <h1 className={styles.title} id="admin-auth-title">
            {title}
          </h1>
          <p className={styles.description}>{description}</p>
          {children}
          {footer ? <nav className={styles.footer}>{footer}</nav> : null}
        </section>
      </div>
    </main>
  );
}
