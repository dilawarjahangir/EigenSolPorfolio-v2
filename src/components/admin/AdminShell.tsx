"use client";

import {
  ArrowUpRight,
  BookOpenText,
  FileText,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import styles from "./AdminShell.module.css";

type AdminShellProps = Readonly<{
  children: ReactNode;
  ownerEmail: string;
}>;

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquareText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings/security", label: "Security", icon: ShieldCheck },
] as const;

function routeIsActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(`${href}/`) || pathname === href;
}

export function AdminShell({ children, ownerEmail }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [desktopNavigation, setDesktopNavigation] = useState(false);
  const [isSigningOut, startSignOut] = useTransition();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(min-width: 64rem)");
    const update = () => setDesktopNavigation(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!navigationOpen || desktopNavigation) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [desktopNavigation, navigationOpen]);

  useEffect(() => {
    if (!navigationOpen) return;
    const firstLink = sidebarRef.current?.querySelector<HTMLAnchorElement>("nav a");
    firstLink?.focus();

    const handleNavigationKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavigationOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = sidebarRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleNavigationKeys);
    return () => document.removeEventListener("keydown", handleNavigationKeys);
  }, [navigationOpen]);

  const signOut = () => {
    startSignOut(async () => {
      await authClient.signOut();
      router.replace("/admin/login");
      router.refresh();
    });
  };

  return (
    <div className={styles.root}>
      <a className={styles.skipLink} href="#admin-main">
        Skip to admin content
      </a>

      <header className={styles.mobileHeader}>
        <Link className={styles.mobileBrand} href="/admin" aria-label="EigenSol admin dashboard">
          <BookOpenText aria-hidden="true" />
          <span>
            <strong>EigenSol</strong>
            <small>Content studio</small>
          </span>
        </Link>
        <button
          className={styles.menuButton}
          type="button"
          aria-label={navigationOpen ? "Close admin navigation" : "Open admin navigation"}
          aria-expanded={navigationOpen}
          aria-controls="admin-navigation"
          ref={menuButtonRef}
          onClick={() => setNavigationOpen((open) => !open)}
        >
          {navigationOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>

      {navigationOpen ? (
        <button
          className={styles.backdrop}
          type="button"
          aria-label="Close admin navigation"
          onClick={() => {
            setNavigationOpen(false);
            menuButtonRef.current?.focus();
          }}
        />
      ) : null}

      <aside
        className={styles.sidebar}
        id="admin-navigation"
        data-open={navigationOpen ? "true" : "false"}
        aria-hidden={!desktopNavigation && !navigationOpen}
        inert={!desktopNavigation && !navigationOpen}
        ref={sidebarRef}
      >
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <BookOpenText />
          </span>
          <div>
            <strong>EigenSol</strong>
            <span>Publishing studio</span>
          </div>
        </div>

        <div className={styles.navigationGroup}>
          <p className={styles.navigationLabel}>Workspace</p>
          <nav className={styles.navigation} aria-label="Admin navigation">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = routeIsActive(pathname, href);

              return (
                <Link
                  className={styles.navigationLink}
                  data-active={active ? "true" : "false"}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  key={href}
                  onClick={() => setNavigationOpen(false)}
                >
                  <span className={styles.navigationIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <span>{label}</span>
                  <span className={styles.activeMarker} aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={styles.account}>
          <div className={styles.accountIdentity}>
            <span className={styles.accountAvatar} aria-hidden="true">
              {ownerEmail.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <span>Owner account</span>
              <strong title={ownerEmail}>{ownerEmail}</strong>
            </div>
          </div>
          <div className={styles.accountActions}>
            <button type="button" onClick={signOut} disabled={isSigningOut}>
              <LogOut aria-hidden="true" />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
            <Link href="/blogs" target="_blank" rel="noreferrer">
              <ArrowUpRight aria-hidden="true" />
              View public site
            </Link>
          </div>
        </div>
      </aside>

      <main className={styles.main} id="admin-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
