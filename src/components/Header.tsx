"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import styles from "./Header.module.css";
import themeStyles from "./HeaderTheme.module.css";
import ThemeToggle from "./ThemeToggle";

const navigation = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [homeActive, setHomeActive] = useState("Home");
  const { scrollY } = useScroll();

  const routeActive = pathname.startsWith("/services")
    ? "Services"
    : pathname.startsWith("/case-studies")
      ? "Projects"
      : pathname.startsWith("/blogs")
        ? "Blogs"
        : pathname === "/about"
          ? "About"
          : pathname === "/contact"
            ? "Contact"
            : pathname === "/"
              ? homeActive
              : "";

  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 20));

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`${styles.header} ${
          scrolled ? styles.headerScrolled : styles.headerTop
        }`}
      >
        <motion.nav
          aria-label="Primary navigation"
          data-header-tone="theme"
          animate={{
            paddingTop: scrolled ? 8 : 10,
            paddingBottom: scrolled ? 8 : 10,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`${styles.nav} ${
            scrolled ? styles.navScrolled : styles.navTop
          } ${themeStyles.themeNav}`}
        >
          <Link
            href="/#home"
            className={styles.brand}
            onClick={() => setHomeActive("Home")}
          >
            <Image
              src="/logo.webp"
              alt="EigenSol"
              width={180}
              height={48}
              className={styles.logo}
              priority
            />
          </Link>

          <ul className={styles.desktopLinks} data-header-links>
            {navigation.map((item) => {
              const isActive = routeActive === item.label;

              return (
                <li
                  key={item.label}
                  className={styles.navItem}
                  data-header-item
                >
                  <Link
                    href={item.href}
                    onClick={() => setHomeActive(item.label)}
                    data-header-link
                    className={`${styles.navLink} ${
                      isActive ? styles.activeLink : ""
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="header-active-link"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                        className={styles.activePill}
                      />
                    )}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className={styles.actions}>
            <ThemeToggle />

            <Link href="/contact" className={styles.contactButton}>
              <span className={styles.contactFilterBlur}>
                <HeaderButtonBlurFilter />
              </span>
              <span
                className={styles.contactFilter}
                style={{ filter: "url(#headerContactFilter)" }}
              >
                <span className={styles.contactText}>Let&apos;s Talk</span>
                <span className={styles.contactIcon}>
                  <HeaderButtonArrow />
                </span>
              </span>
            </Link>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className={styles.menuButton}
              data-header-menu
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </motion.nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.mobileMenu}
          >
            <button
              type="button"
              className={styles.mobileBackdrop}
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              aria-label="Mobile navigation"
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={styles.mobilePanel}
            >
              <ul>
                {navigation.map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.04 * index }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => {
                        setHomeActive(item.label);
                        setOpen(false);
                      }}
                    >
                      {item.label}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={styles.mobileContact}
                onClick={() => setOpen(false)}
              >
                Let&apos;s Talk <ArrowUpRight aria-hidden="true" />
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function HeaderButtonBlurFilter() {
  return (
    <svg width="0" height="0" aria-hidden="true">
      <defs>
        <filter id="headerContactFilter">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="5"
            result="blur"
          />
          <feColorMatrix
            in="blur"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
          />
          <feComposite
            in="SourceGraphic"
            in2="headerContactFilter"
            operator="atop"
          />
          <feBlend in="SourceGraphic" in2="headerContactFilter" />
        </filter>
      </defs>
    </svg>
  );
}

function HeaderButtonArrow() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1 9L9 1M9 1H1M9 1V9"
        stroke="currentcolor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
