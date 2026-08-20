"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import {
  SplitText,
  gsap,
  prefersReducedMotion,
  useGSAP,
  whenFontsReady,
} from "./gsap-init";

type SplitLinesProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Animate on load rather than on scroll. Use for the hero only. */
  onLoad?: boolean;
};

/**
 * Raises a heading into place one line at a time.
 *
 * SplitText re-wraps the text in per-line spans, so the split is reverted on
 * cleanup to leave the DOM as authored — the heading is a landmark for
 * assistive tech and should not be left as a pile of spans.
 *
 * The heading renders visible and is hidden inside the effect rather than by an
 * inline `opacity: 0`. useGSAP runs before paint, so there is no flash, and the
 * heading is still readable if the script never arrives.
 */
export default function SplitLines({
  children,
  as: Tag = "h2",
  className,
  delay = 0,
  onLoad = false,
}: SplitLinesProps) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const target = scope.current;
      if (!target) return;

      if (prefersReducedMotion()) return;

      let cancelled = false;
      let split: SplitText | undefined;
      let tween: gsap.core.Tween | undefined;

      // Hide immediately so there is no flash, then split once the font is in.
      gsap.set(target, { opacity: 0 });

      whenFontsReady(() => {
        if (cancelled) return;
        split = new SplitText(target, { type: "lines", linesClass: "split-line" });
        gsap.set(target, { opacity: 1 });

        tween = gsap.from(split.lines, {
          yPercent: 118,
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.08,
          delay,
          ...(onLoad
            ? {}
            : { scrollTrigger: { trigger: target, start: "top 88%", once: true } }),
        });
      });

      // Created after the effect body, so these are killed by hand.
      return () => {
        cancelled = true;
        tween?.kill();
        split?.revert();
        gsap.set(target, { clearProps: "opacity" });
      };
    },
    { scope, dependencies: [delay, onLoad] },
  );

  return (
    <Tag ref={scope} className={className}>
      {children}
    </Tag>
  );
}
