import styles from "./FloatingSocialLinks.module.css";

const socialLinks = [
  {
    label: "Chat with EigenSol on WhatsApp",
    href: "https://wa.me/923260335144",
    className: styles.whatsapp,
    icon: WhatsAppIcon,
  },
  {
    label: "Follow EigenSol on Instagram",
    href: "https://www.instagram.com/eigensol.official",
    className: styles.instagram,
    icon: InstagramIcon,
  },
] as const;

export default function FloatingSocialLinks() {
  return (
    <nav className={styles.links} aria-label="Quick social links">
      {socialLinks.map(({ label, href, className, icon: Icon }) => (
        <a
          className={`${styles.link} ${className}`}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noreferrer noopener"
          key={label}
        >
          <Icon />
        </a>
      ))}
    </nav>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="M20.5 11.6a8.5 8.5 0 0 1-12.55 7.48L3.5 20.5l1.45-4.28A8.5 8.5 0 1 1 20.5 11.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.35 7.65c.2-.45.42-.46.74-.47h.63c.2 0 .4.08.5.35l.72 1.74c.08.25.04.42-.1.62l-.55.7c-.16.18-.13.35-.02.55.7 1.23 1.62 2.15 2.85 2.84.2.11.37.14.55-.02l.7-.83c.18-.2.38-.23.62-.14l1.87.88c.26.12.34.3.28.55-.13.62-.52 1.18-1.04 1.52-.53.34-1.22.5-1.83.34-1.03-.26-2.36-.86-3.68-2.02-1.09-.96-2.03-2.12-2.58-3.34-.3-.68-.27-1.44.04-2.1l.3-.67Z"
        fill="currentColor"
      />
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
