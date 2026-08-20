"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EVENT } from "@/lib/expo-content";
import "./site.css";

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

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  return (
    <header className={`site-head${scrolled ? " is-solid" : ""}`}>
      <Link className="lockup" href="/" aria-label={`${EVENT.name} home`}>
        {/* Typographic stand-in. Drop the real emblem in here. */}
        <span className="lockup-mark" aria-hidden="true">
          75
        </span>
        <span className="lockup-text">
          <b>PharmaExpo</b>
          <i>{EVENT.milestone}</i>
        </span>
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
          <span aria-hidden="true">{open ? "✕" : "☰"}</span>
        </button>
      </div>
    </header>
  );
}
