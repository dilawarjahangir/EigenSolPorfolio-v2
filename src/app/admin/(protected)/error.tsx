"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import styles from "@/components/admin/AdminUi.module.css";

type AdminErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("Admin route failed", { digest: error.digest ?? "unknown" });
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={`${styles.emptyState} ${styles.panel}`} role="alert">
        <AlertTriangle aria-hidden="true" />
        <h1>We couldn’t load this admin page</h1>
        <p>The request failed safely. Retry now, or refresh after checking the database service.</p>
        <button className={styles.button} type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
