"use client";

import { useEffect, type RefObject } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/animation/gsap";
import { DURATION, EASE } from "@/lib/animation/tokens";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

type ScrollRevealOptions = {
  y?: number;
  stagger?: number;
  start?: string;
};

export function useScrollReveal(
  containerRef: RefObject<HTMLElement | null>,
  targetSelector: string,
  options: ScrollRevealOptions = {}
) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(targetSelector);
    if (!targets.length) return;

    if (reducedMotion) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    registerGsap();
    const { y = 40, stagger = 0.12, start = "top 75%" } = options;

    gsap.set(targets, { opacity: 0, y });

    const trigger = ScrollTrigger.create({
      trigger: container,
      start,
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: DURATION.slow,
          ease: EASE.ipcSmooth,
          stagger,
        });
      },
    });

    return () => trigger.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);
}
