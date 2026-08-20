"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "./gsap-init";

type CounterProps = {
  to: number;
  /** Rendered after the number, e.g. "+" or "sqm". */
  suffix?: string;
  className?: string;
  duration?: number;
};

/**
 * Counts a figure up when it scrolls into view.
 *
 * The final value is what renders on the server, so the real number is present
 * for search engines, for reduced-motion visitors and if the script fails.
 */
export default function Counter({
  to,
  suffix = "",
  className,
  duration = 1.4,
}: CounterProps) {
  const node = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const target = node.current;
    if (!target || prefersReducedMotion()) return;

    const value = { n: 0 };
    gsap.to(value, {
      n: to,
      duration,
      ease: "power2.out",
      scrollTrigger: { trigger: target, start: "top 88%", once: true },
      onUpdate: () => {
        target.textContent = `${Math.round(value.n)}${suffix}`;
      },
      onComplete: () => {
        target.textContent = `${to}${suffix}`;
      },
    });
  }, [to, suffix, duration]);

  return (
    <span ref={node} className={className}>
      {to}
      {suffix}
    </span>
  );
}
