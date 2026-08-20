"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const NARROW = "(max-width: 860px)";

type Connection = { saveData?: boolean; effectiveType?: string };

/**
 * Whether a decorative background video is worth playing right now.
 *
 * Read through `useSyncExternalStore` rather than an effect, because these are
 * genuinely external and genuinely live: rotating a phone or switching on
 * reduced motion should change the answer immediately, not on the next mount.
 * The server always answers "no", so the poster is what renders first.
 */
export function useVideoAllowed(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(REDUCED_MOTION), window.matchMedia(NARROW)];
  for (const query of queries) query.addEventListener("change", onChange);
  return () => {
    for (const query of queries) query.removeEventListener("change", onChange);
  };
}

function getSnapshot(): boolean {
  if (window.matchMedia(REDUCED_MOTION).matches) return false;
  if (window.matchMedia(NARROW).matches) return false;

  // Non-standard, but the only signal for metered or slow connections.
  const connection = (navigator as Navigator & { connection?: Connection })
    .connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /2g|slow-2g|3g/.test(connection.effectiveType)) {
    return false;
  }
  return true;
}
