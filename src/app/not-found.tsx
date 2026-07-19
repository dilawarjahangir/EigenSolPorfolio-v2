import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HistoryBackButton from "@/components/site/HistoryBackButton";
import styles from "@/components/site/NotFoundPage.module.css";
import SitePageShell from "@/components/site/SitePageShell";

export default function NotFound() {
  return (
    <SitePageShell>
      <section className={styles.page}>
        <Image
          className={styles.background}
          src="/software-development.webp"
          alt=""
          fill
          sizes="100vw"
          priority
        />
        <span className={styles.scrim} />
        <span className={styles.grid} aria-hidden="true" />
        <div className={styles.content}>
          <p className={styles.code}>404</p>
          <h1>This page is not available.</h1>
          <p className={styles.description}>
            The address may be outdated, or the page may have moved. Continue to the EigenSol
            homepage or return to the previous screen.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/">
              Go home
              <ArrowRight aria-hidden="true" />
            </Link>
            <HistoryBackButton />
          </div>
        </div>
      </section>
    </SitePageShell>
  );
}
