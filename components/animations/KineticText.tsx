"use client";

import { useEffect, useRef, type ElementType } from "react";
import SplitType from "split-type";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/animation/gsap";
import { DURATION, EASE } from "@/lib/animation/tokens";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import styles from "./KineticText.module.css";

type SplitUnit = "chars" | "words" | "lines";
type RevealTrigger = "mount" | "scroll";

export interface KineticTextProps {
  /** The text content to reveal. Required — this is the source of truth SplitType splits. */
  text: string;
  /** The element/tag the text renders as. Defaults to `span`. */
  as?: keyof JSX.IntrinsicElements;
  /** The unit SplitType breaks the text into for the stagger reveal. Defaults to `words`. */
  splitBy?: SplitUnit;
  /** `mount` plays immediately on mount; `scroll` plays once when the element enters the viewport. */
  trigger?: RevealTrigger;
  /** Per-unit stagger, in seconds. Defaults to a sensible value per `splitBy`. */
  stagger?: number;
  /** Delay, in seconds, before the reveal starts. */
  delay?: number;
  className?: string;
}

const DEFAULT_STAGGER: Record<SplitUnit, number> = {
  chars: 0.03,
  words: 0.06,
  lines: 0.08,
};

/**
 * Kinetic-typography text reveal. Splits `text` into chars/words/lines with
 * `split-type`, wraps each unit in an overflow-hidden mask, then animates the
 * unit from `{ yPercent: 100, opacity: 0 }` to visible with a GSAP stagger —
 * a clean upward "rising into place" reveal. Only transform/opacity are
 * animated, per the performance rule.
 *
 * Respects reduced-motion: when active, SplitType/GSAP are skipped entirely
 * and the plain text is rendered as-is.
 */
export function KineticText({
  text,
  as = "span",
  splitBy = "words",
  trigger = "mount",
  stagger,
  delay = 0,
  className,
}: KineticTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (reducedMotion || !text.trim()) {
      // No animation path: make sure the DOM reflects the plain, correct
      // text (also undoes any split markup left over from a previous run).
      node.textContent = text;
      return;
    }

    registerGsap();

    // Sync the DOM to the current `text` prop before splitting. React may
    // hold a stale reference to a text node that SplitType has already
    // replaced (via `replaceWith`) on a prior run, so we can't rely on the
    // rendered `{text}` child alone to reflect updates — force it here.
    node.textContent = text;

    const splitInstance = new SplitType(node, {
      types:
        splitBy === "chars" ? ["words", "chars"] : splitBy === "lines" ? ["lines"] : ["words"],
    });

    const units =
      splitBy === "chars"
        ? splitInstance.chars
        : splitBy === "lines"
          ? splitInstance.lines
          : splitInstance.words;

    let tween: gsap.core.Tween | null = null;
    let scrollTrigger: ScrollTrigger | null = null;

    if (units && units.length > 0) {
      // Wrap each unit in its own overflow-hidden mask so the translateY
      // reveal is clipped cleanly instead of sliding across visible text.
      units.forEach((unit) => {
        const mask = document.createElement(splitBy === "lines" ? "div" : "span");
        mask.className = splitBy === "lines" ? styles.maskLine : styles.mask;
        unit.parentNode?.insertBefore(mask, unit);
        mask.appendChild(unit);
        unit.classList.add(styles.unit);
      });

      gsap.set(units, { yPercent: 100, opacity: 0 });

      const effectiveStagger = stagger ?? DEFAULT_STAGGER[splitBy];

      const play = () => {
        tween = gsap.to(units, {
          yPercent: 0,
          opacity: 1,
          duration: DURATION.medium,
          ease: EASE.ipcSmooth,
          delay,
          stagger: effectiveStagger,
        });
      };

      if (trigger === "scroll") {
        scrollTrigger = ScrollTrigger.create({
          trigger: node,
          start: "top 80%",
          once: true,
          onEnter: play,
        });
      } else {
        play();
      }
    }

    return () => {
      scrollTrigger?.kill();
      tween?.kill();
      splitInstance.revert();
    };
  }, [text, splitBy, trigger, stagger, delay, reducedMotion]);

  const Component = as as ElementType;

  return (
    <Component ref={containerRef} className={className}>
      {text}
    </Component>
  );
}
