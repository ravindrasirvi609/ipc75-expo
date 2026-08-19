"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/animation/gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    registerGsap();
    if (reducedMotion) return;

    const lenis = new Lenis({
      autoRaf: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
