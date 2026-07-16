"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const darkHeroRoutes = ["/services", "/case-studies", "/contact", "/careers"];
  const hasDarkHero = darkHeroRoutes.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const useLightHeaderTone = hasDarkHero && !isScrolled;
  const inactiveNavClass = useLightHeaderTone
    ? "text-white/80 hover:text-white"
    : "text-[#585858] hover:text-[#121212]";
  const mobileToggleClass = useLightHeaderTone ? "text-white" : "text-[#121212]";

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <motion.div className="flex cursor-pointer items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.webp"
                alt="EigenSol"
                width={180}
                height={48}
                className={`transition-all duration-300 ${
                  isScrolled ? "h-8 w-auto" : "h-10 w-auto"
                }`}
                priority
              />
            </Link>
          </motion.div>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-md font-bold transition-colors ${
                  pathname === item.href ? "text-[#ff7744]" : inactiveNavClass
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/contact"
              className="rounded-full bg-[#ff7744] px-6 py-2.5 text-white transition-colors hover:bg-[#e85d2c]"
            >
              Start a Project
            </Link>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className={`p-2 transition-colors lg:hidden ${mobileToggleClass}`}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 bg-white lg:hidden"
          >
            <nav className="space-y-3 px-6 py-4">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block py-2 text-base font-medium ${
                    pathname === item.href
                      ? "text-[#ff7744]"
                      : "text-[#585858] hover:text-[#121212]"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="mt-4 block w-full rounded-full bg-[#ff7744] px-6 py-2.5 text-center text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start a Project
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
