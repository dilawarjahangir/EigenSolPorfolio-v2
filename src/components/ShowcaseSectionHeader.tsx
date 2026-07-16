import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ShowcaseSectionHeader.module.css";

type ShowcaseSectionHeaderProps = {
  subtitle: ReactNode;
  title: string;
  ctaLabel: string;
  ctaHref: string;
};

export default function ShowcaseSectionHeader({
  subtitle,
  title,
  ctaLabel,
  ctaHref,
}: ShowcaseSectionHeaderProps) {
  return (
    <div className={`${styles.topWrap} studio-project-top-wrap`}>
      <div className={styles.row}>
        <div className={`${styles.column} ${styles.subtitleColumn}`}>
          <div className="studio-project-subtitle-box">
            <h3 className={`${styles.subtitle} tp-section-subtitle-clash`}>
              {subtitle}
              <i>
                <HeaderArrow />
              </i>
            </h3>
          </div>
        </div>

        <div className={`${styles.column} ${styles.headingColumn}`}>
          <div className={`${styles.titleWrap} studio-project-title-wrap`}>
            <div className={`${styles.row} ${styles.titleRow}`}>
              <div className={`${styles.column} ${styles.titleColumn}`}>
                <div className={`${styles.titleBox} studio-project-title-box`}>
                  <h3 className={`${styles.title} tp-section-title-clash`}>{title}</h3>
                </div>
              </div>
              <div className={`${styles.column} ${styles.buttonColumn}`}>
                <div className={`${styles.sectionButton} studio-project-btn`}>
                  <Link className={styles.cta} href={ctaHref}>
                    <span>{ctaLabel}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderArrow() {
  return (
    <svg
      width="102"
      height="9"
      viewBox="0 0 102 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M98 8L101.5 4.5L98 1M1 4H101V5H1V4Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
