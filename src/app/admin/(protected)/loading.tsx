import styles from "@/components/admin/AdminUi.module.css";

export default function AdminLoading() {
  return (
    <div className={styles.page} role="status" aria-live="polite">
      <div className={styles.loadingCard}>
        <p className="sr-only">Loading the latest admin workspace data.</p>
        <div className={styles.skeleton} aria-hidden="true" />
        <div className={styles.skeleton} aria-hidden="true" />
        <div className={styles.skeleton} aria-hidden="true" />
      </div>
    </div>
  );
}
