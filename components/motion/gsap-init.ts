"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * Single registration point for GSAP and its plugins. Every animated component
 * imports from here so a plugin is never registered twice or forgotten once.
 *
 * ScrollTrigger and SplitText both ship inside the `gsap` package (free since
 * 3.13) — no separate club install.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText, useGSAP };

/**
 * True when the visitor has asked for less motion. Animated components check
 * this and render their finished state instead of animating to it — nobody
 * should have to sit through a reveal to read a price.
 */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Resolves once the web fonts are in.
 *
 * Anything that measures text has to wait for this. SplitText decides where the
 * lines break by reading the rendered layout — run it in the fallback font and
 * it splits at the wrong words, then the reveal masks the wrong words too.
 */
export function whenFontsReady(run: () => void) {
  const fonts = typeof document !== "undefined" ? document.fonts : undefined;
  if (!fonts || fonts.status === "loaded") {
    run();
    return;
  }
  fonts.ready.then(run).catch(run);
}

/**
 * A font swap changes every element's position, which leaves ScrollTrigger
 * holding stale measurements. Re-measure once, after the swap.
 */
if (typeof document !== "undefined") {
  whenFontsReady(() => ScrollTrigger.refresh());
}
