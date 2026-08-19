"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/animation/gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useIsTouchDevice } from "@/lib/hooks/useIsTouchDevice";
import { useCursor } from "@/providers/CursorProvider";
import styles from "./Cursor.module.css";

const LABELS: Record<string, string> = {
  view: "View",
  explore: "Explore",
  drag: "Drag",
  open: "Open",
  play: "Play",
};

export function Cursor() {
  const { state } = useCursor();
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || isTouch) return;
    registerGsap();

    const dot = dotRef.current;
    if (!dot) return;

    const moveX = gsap.quickTo(dot, "x", { duration: 0.5, ease: "power3.out" });
    const moveY = gsap.quickTo(dot, "y", { duration: 0.5, ease: "power3.out" });

    const onMouseMove = (event: MouseEvent) => {
      moveX(event.clientX);
      moveY(event.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [reducedMotion, isTouch]);

  if (reducedMotion || isTouch) return null;

  return (
    <div ref={dotRef} className={styles.cursor} data-state={state} aria-hidden="true">
      <span className={styles.label}>{LABELS[state]}</span>
    </div>
  );
}
