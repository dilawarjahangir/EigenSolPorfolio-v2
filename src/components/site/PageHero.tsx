import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  actions?: ReactNode;
  imagePosition?: string;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  actions,
  imagePosition = "center",
}: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <Image
        className={styles.image}
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        style={{ objectPosition: imagePosition }}
      />
      <div className={styles.scrim} />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </section>
  );
}
