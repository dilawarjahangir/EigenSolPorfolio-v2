import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import styles from "./PageCta.module.css";

type PageCtaProps = {
  title: string;
  description: string;
  label: string;
  href: string;
};

export default function PageCta({ title, description, label, href }: PageCtaProps) {
  return (
    <section className={styles.area}>
      <div className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>Start a conversation</p>
          <h2>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>
        <Link className={styles.link} href={href}>
          <span>{label}</span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
