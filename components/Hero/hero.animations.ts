"use client";

import { gsap, registerGsap } from "@/lib/animation/gsap";
import { DURATION, EASE } from "@/lib/animation/tokens";

export function playHeroEntrance(elements: (HTMLElement | null)[]) {
  registerGsap();
  const targets = elements.filter((el): el is HTMLElement => el !== null);
  if (!targets.length) return gsap.timeline();

  gsap.set(targets, { opacity: 0, y: 24 });

  return gsap.timeline({ delay: 0.2 }).to(targets, {
    opacity: 1,
    y: 0,
    duration: DURATION.slow,
    ease: EASE.ipcSmooth,
    stagger: 0.12,
  });
}
