"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { EVENT } from "@/lib/expo-content";
import "./site.css";

/** Where the real emblem goes. Falls back to the typographic mark until it exists. */
const LOGO_SRC = "/assets/logo.png";

const NAV = [
  { label: "Why exhibit", href: "/#why" },
  { label: "Who exhibits", href: "/#exhibitors" },
  { label: "Who visits", href: "/#visitors" },
  { label: "Charges", href: "/exhibit" },
  { label: "Floor plan", href: "/floor-plan" },
  { label: "Contact", href: "/contact" },
];

/**
 * Site header. Transparent over the navy hero, solid once the page scrolls, so
 * the wordmark never sits on a colour it was not designed against.
 */
export default function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(solid);
  const [open, setOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  /**
   * The open panel is only as tall as its own links, so without a scrim the
   * hero content directly beneath stays visible right up against the last
   * row — reads as a rendering glitch rather than a menu. This dims the rest
   * of the page and stops it scrolling while the menu is open.
   */
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className={`site-head${scrolled ? " is-solid" : ""}`}>
      <Link className="lockup" href="/" aria-label={`${EVENT.name} home`}>
        {logoFailed ? (
          <>
            {/* Typographic stand-in, shown until /assets/logo.png exists. */}
            <span className="lockup-mark" aria-hidden="true">
              75
            </span>
            <span className="lockup-text">
              <b>PharmaExpo</b>
              <i>{EVENT.milestone}</i>
            </span>
          </>
        ) : (
          <Image
            className="lockup-logo"
            src={LOGO_SRC}
            alt={`${EVENT.parent} — ${EVENT.milestone}`}
            width={220}
            height={56}
            priority
            unoptimized
            onError={() => setLogoFailed(true)}
          />
        )}
      </Link>

      <nav className={`site-nav${open ? " is-open" : ""}`} aria-label="Main">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="head-actions">
        <Link className="btn btn-primary" href="/floor-plan">
          Book a stall
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={18} strokeWidth={1.75} aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <button
          type="button"
          className="nav-scrim"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </header>
  );
}
