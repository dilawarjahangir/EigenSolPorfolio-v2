import Image from "next/image";
import { portfolioProjects } from "@/data/projects";
import MetroProjectRow from "./MetroProjectRow";
import styles from "./MetroWorkPage.module.css";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/EigenSol/61572598540107/",
    external: true,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/eigensol.official",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/eigensol",
    external: true,
  },
  {
    label: "Email",
    href: "mailto:info@eigensol.com",
    external: false,
  },
] as const;

type Partner = {
  src: string;
  alt: string;
  dark?: boolean;
};

const partners: Partner[] = [
  { src: "/trusted-partners/1016.svg", alt: "1016 Industries" },
  { src: "/trusted-partners/entaai-logo.webp", alt: "Enta AI" },
  { src: "/trusted-partners/hmc-holdings.webp", alt: "HMC Holdings" },
  { src: "/trusted-partners/HotelsTask.webp", alt: "HotelsTask" },
  { src: "/trusted-partners/logo.svg", alt: "A2 Properties", dark: true },
  { src: "/trusted-partners/saitareward.webp", alt: "Saita Reward" },
] as const;

const movingPartners = [...partners, ...partners];

export default function MetroWorkPage() {
  return (
    <div className={`${styles.page} metro-work-page`}>
      <section className={styles.workArea} aria-labelledby="recent-work-title">
        <div className={styles.container}>
          <header className={`${styles.titleWrap} metro-title-box`}>
            <div className={styles.knowMore} aria-hidden="true">
              <svg viewBox="0 0 732 9" fill="none">
                <path
                  d="M728 7.96512L731.5 4.48256L728 1M1 4H731V5H1V4Z"
                  stroke="currentColor"
                  strokeOpacity="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Know More</span>
            </div>

            <div className={styles.titleGrid}>
              <div className={styles.headingColumn}>
                <h1 className={styles.pageTitle} id="recent-work-title">
                  <span className={`${styles.heroLine} metro-title-scroll metro-title-invert`}>
                    Recent
                  </span>
                  <span className={`${styles.heroLine} metro-title-invert`}>Work</span>
                </h1>
              </div>

              <nav className={styles.socials} aria-label="EigenSol social links">
                <ul>
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target={social.external ? "_blank" : undefined}
                      rel={social.external ? "noreferrer noopener" : undefined}
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
                </ul>
              </nav>
            </div>
          </header>

          <div className={styles.projects}>
            {portfolioProjects.map((project, index) => (
              <MetroProjectRow key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.clientsArea} aria-labelledby="clients-title">
        <div className={styles.clientsContainer}>
          <div className={styles.clientsTitleBox}>
            <h2 className={styles.clientsTitle} id="clients-title">
              Our clients
              <svg aria-hidden="true" viewBox="0 0 103 9" fill="none">
                <path
                  d="M99 7.96512L102.5 4.48256L99 1M1 4H102V5H1V4Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </h2>
          </div>
        </div>

        {[false, true].map((isSecondRow) => (
          <div
            className={`${styles.logoRow} ${
              isSecondRow ? styles.logoRowBottom : styles.logoRowTop
            }`}
            data-metro-logo-row
            key={String(isSecondRow)}
          >
            <div className={styles.logoTrack} data-metro-logo-track>
              {movingPartners.map((partner, index) => (
                <div
                  className={`${styles.logoCard} ${partner.dark ? styles.logoCardDark : ""}`}
                  key={`${isSecondRow ? "bottom" : "top"}-${partner.src}-${index}`}
                  aria-hidden={index >= partners.length}
                >
                  <Image
                    src={partner.src}
                    alt={index < partners.length ? partner.alt : ""}
                    width={240}
                    height={100}
                    sizes="240px"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
