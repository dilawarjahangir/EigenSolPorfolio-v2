import styles from "@/components/admin/AdminUi.module.css";

export default function AdminLoading() {
  return (
    <div className={styles.page} role="status" aria-live="polite">
      <p className={styles.eyebrow}>EigenSol CMS</p>
      <h1 className={styles.title}>Loading admin workspace…</h1>
      <p className={styles.description}>Retrieving the latest content and moderation state.</p>
    </div>
  );
}
