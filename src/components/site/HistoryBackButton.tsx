"use client";

import { ArrowLeft } from "lucide-react";
import styles from "./NotFoundPage.module.css";

export default function HistoryBackButton() {
  return (
    <button type="button" className={styles.secondaryButton} onClick={() => window.history.back()}>
      <ArrowLeft aria-hidden="true" />
      Go back
    </button>
  );
}
