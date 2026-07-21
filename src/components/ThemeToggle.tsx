"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

type ThemeToggleProps = {
  inverse?: boolean;
  className?: string;
};

const themeChangeEvent = "eigensol-theme-change";
const themeStorageKey = "eigensol-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

  const handlePreferenceChange = (event: MediaQueryListEvent) => {
    if (localStorage.getItem(themeStorageKey)) return;

    applyTheme(event.matches ? "dark" : "light");
    onStoreChange();
  };

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key !== themeStorageKey) return;

    const nextTheme =
      event.newValue === "dark" || event.newValue === "light"
        ? event.newValue
        : colorScheme.matches
          ? "dark"
          : "light";

    applyTheme(nextTheme);
    onStoreChange();
  };

  window.addEventListener(themeChangeEvent, onStoreChange);
  window.addEventListener("storage", handleStorageChange);
  colorScheme.addEventListener("change", handlePreferenceChange);

  return () => {
    window.removeEventListener(themeChangeEvent, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
    colorScheme.removeEventListener("change", handlePreferenceChange);
  };
}

export default function ThemeToggle({
  inverse = false,
  className = "",
}: ThemeToggleProps) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "light",
  );

  const toggleTheme = () => {
    const nextTheme: Theme =
      getThemeSnapshot() === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    localStorage.setItem(themeStorageKey, nextTheme);
    window.dispatchEvent(new Event(themeChangeEvent));
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`${styles.toggle} ${inverse ? styles.inverse : ""} ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}
