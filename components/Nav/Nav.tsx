"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { RoomLink } from "@/components/RoomTransition/RoomLink";
import { useCursorHover } from "@/providers/CursorProvider";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "/", label: "Home", direction: "back" as const },
  { href: "/register", label: "Register", direction: "forward" as const },
];

export function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const cursorHover = useCursorHover("view");

  return (
    <header className={styles.header}>
      <RoomLink href="/" direction="back" className={styles.wordmark} {...cursorHover}>
        IPC 75
      </RoomLink>

      <nav className={styles.desktopNav}>
        {LINKS.map((link) => (
          <RoomLink
            key={link.href}
            href={link.href}
            direction={link.direction}
            className={styles.navLink}
            data-active={pathname === link.href}
            {...cursorHover}
          >
            {link.label}
          </RoomLink>
        ))}
      </nav>

      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className={styles.menuLine} data-open={menuOpen} />
        <span className={styles.menuLine} data-open={menuOpen} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className={styles.mobileNav}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {LINKS.map((link) => (
              <RoomLink
                key={link.href}
                href={link.href}
                direction={link.direction}
                className={styles.mobileNavLink}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </RoomLink>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
