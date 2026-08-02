import { AdminTwoFactorSetup } from "@/components/admin/auth/AdminTwoFactorSetup";
import styles from "@/components/admin/AdminUi.module.css";
import { requireOwnerForSetup } from "@/services/auth/AdminAuthService";

export default async function AdminSecurityPage() {
  await requireOwnerForSetup();

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderCopy}>
          <p className={styles.eyebrow}>Account security</p>
          <h1 className={styles.title}>Two-factor authentication</h1>
          <p className={styles.description}>
            Protect the owner account with a time-based one-time password and one-use recovery
            codes.
          </p>
        </div>
      </header>
      <section aria-label="Two-factor settings">
        <AdminTwoFactorSetup />
      </section>
    </div>
  );
}
