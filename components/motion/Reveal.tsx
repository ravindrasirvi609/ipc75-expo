"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "./gsap-init";

type RevealProps = {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Seconds between each child. 0 animates them as one block. */
  stagger?: number;
  /** Distance each child rises, in px. */
  distance?: number;
  delay?: number;
  /** Scroll position that fires it, in ScrollTrigger syntax. */
  start?: string;
};

/**
 * Reveals its direct children on scroll, staggered.
 *
 * Children start hidden via a class the CSS owns, so nothing flashes before
 * hydration. Under reduced-motion the class is simply cleared with no tween.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className,
  stagger = 0.07,
  distance = 26,
  delay = 0,
  start = "top 82%",
}: RevealProps) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>(
        scope.current?.children ?? [],
      );
      if (!targets.length) return;

      if (prefersReducedMotion()) {
        gsap.set(targets, { clearProps: "all", opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration: 0.72,
          delay,
          ease: "power3.out",
          stagger,
          scrollTrigger: { trigger: scope.current, start, once: true },
        },
      );
    },
    { scope, dependencies: [stagger, distance, delay, start] },
  );

  return (
    <Tag ref={scope} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
