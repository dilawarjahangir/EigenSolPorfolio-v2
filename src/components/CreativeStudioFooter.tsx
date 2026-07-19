import Link from "next/link";
import type { ComponentType } from "react";
import BackToTopLink from "./BackToTopLink";
import styles from "./CreativeStudioFooter.module.css";

type SocialLink = {
  label: string;
  href: string;
  delay: string;
  icon: ComponentType;
  external?: boolean;
};

const quickLinks = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Projects", href: "/case-studies" },
  { label: "Work", href: "/case-studies" },
  { label: "Contact Us", href: "/contact" },
];

const socialLinks: SocialLink[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/EigenSol/61572598540107/",
    delay: ".9",
    icon: FacebookIcon,
    external: true,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/eigensol.official",
    delay: ".7",
    icon: InstagramIcon,
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/eigensol",
    delay: ".5",
    icon: LinkedInIcon,
    external: true,
  },
  {
    label: "Email",
    href: "mailto:info@eigensol.com",
    delay: ".3",
    icon: MailIcon,
  },
];

export default function CreativeStudioFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} creative-footer-style`}>
      <div className={styles.socialRail} aria-label="EigenSol social links">
        {socialLinks.map(({ label, href, delay, icon: Icon, external }) => (
          <div
            className={`${styles.socialItem} tp_fade_anim`}
            data-delay={delay}
            data-fade-from="top"
            data-ease="bounce"
            key={label}
          >
            <a
              className={styles.socialLink}
              href={href}
              aria-label={label}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer noopener" : undefined}
            >
              <Icon />
            </a>
          </div>
        ))}
      </div>

      <div className={styles.cornerMessage}>
        <BackToTopLink className={styles.cornerLink}>
          {"EigenSol I\u2019ve gone too far, send me back up \uD83D\uDC46"}
        </BackToTopLink>
      </div>

      <div className={styles.footerArea}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={`${styles.column} ${styles.headlineColumn}`}>
              <div
                className={`${styles.widget} ${styles.headlineWidget} tp_fade_anim`}
                data-delay=".3"
                data-fade-from="bottom"
              >
                <h2 className={styles.headline}>
                  Helping <br />
                  start-ups scale &amp; grow.
                </h2>
              </div>
            </div>

            <div className={`${styles.column} ${styles.linksColumn}`}>
              <div
                className={`${styles.widget} ${styles.linksWidget} tp_fade_anim`}
                data-delay=".5"
                data-fade-from="bottom"
              >
                <h3 className={`${styles.widgetTitle} ${styles.linksTitle}`}>Quick Links</h3>
                <nav aria-label="Footer navigation">
                  <ul className={styles.quickLinks}>
                    {quickLinks.map((link) => (
                      <li key={link.label}>
                        <Link className={styles.quickLink} href={link.href}>
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            <div className={`${styles.column} ${styles.contactColumn}`}>
              <div
                className={`${styles.widget} ${styles.contactWidget} tp_fade_anim`}
                data-delay=".7"
                data-fade-from="bottom"
                data-on-scroll="3"
              >
                <h3 className={`${styles.widgetTitle} ${styles.contactTitle}`}>Say Hello!</h3>
                <div className={styles.contactLinks}>
                  <a href="mailto:info@eigensol.com">info@eigensol.com</a>
                  <a href="tel:+923260335144">+92 326 0335144</a>
                </div>
                <a
                  className={styles.address}
                  href="https://www.google.com/maps/search/?api=1&query=EigenSol%2C%20Khayaban-e-Amin%2C%20Lahore"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  3570 N2 Block, Khayaban-e-Amin
                  <br />
                  Lahore, Pakistan
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.wordmarkWrap} aria-hidden="true">
        <p className={styles.wordmark}>
          <span>eigensol.com</span>
        </p>
      </div>

      <div className={styles.copyrightArea}>
        <div className={styles.copyrightContainer}>
          <div className={styles.copyrightRow}>
            <div className={styles.copyrightColumn}>
              <p className={styles.copyrightText}>
                {"\u00A9"}
                {year} EigenSol. All rights reserved.
              </p>
            </div>
            <div className={styles.legalColumn} aria-label="Legal information">
              <a href="/terms-and-conditions">Terms and Conditions</a>
              <a href="/privacy-policy">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 16">
      <path d="M7.7 15V8.6H9.9L10.2 6.1H7.7V4.5C7.7 3.8 7.9 3.3 9 3.3H10.3V1.1C10.1 1.1 9.3 1 8.4 1C6.5 1 5.2 2.2 5.2 4.3V6.1H3V8.6H5.2V15H7.7Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5.34 7.53A2.34 2.34 0 1 0 5.34 2.85a2.34 2.34 0 0 0 0 4.68ZM3.34 21h4V9h-4v12ZM9.66 9h3.83v1.64h.05c.53-1.01 1.84-2.08 3.78-2.08 4.04 0 4.79 2.66 4.79 6.12V21h-4v-5.61c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 5.5h18v13H3v-13Zm2 2v.18l7 4.77 7-4.77V7.5H5Zm14 8.99v-6.4l-7 4.77-7-4.77v6.4h14Z" />
    </svg>
  );
}
