"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, registerGsap } from "@/lib/animation/gsap";
import { DURATION, EASE } from "@/lib/animation/tokens";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import styles from "@/components/RoomTransition/RoomTransitionOverlay.module.css";

type RoomTransitionContextValue = {
  playIn: () => void;
};

const RoomTransitionContext = createContext<RoomTransitionContextValue | null>(null);

export function useRoomTransition() {
  const context = useContext(RoomTransitionContext);
  if (!context) {
    throw new Error("useRoomTransition must be used within a RoomTransitionProvider");
  }
  return context;
}

export function RoomTransitionProvider({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    registerGsap();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const overlay = overlayRef.current;
    if (!overlay || reducedMotion) return;

    setCovered(false);
    gsap.to(overlay, {
      scaleY: 0,
      transformOrigin: "bottom",
      duration: DURATION.medium,
      ease: EASE.ipcSmooth,
    });
  }, [pathname, reducedMotion]);

  const playIn = () => {
    const overlay = overlayRef.current;
    if (!overlay || reducedMotion) return;

    gsap.set(overlay, { transformOrigin: "top" });
    gsap.to(overlay, {
      scaleY: 1,
      duration: DURATION.fast,
      ease: EASE.power3InOut,
      onComplete: () => setCovered(true),
    });
  };

  return (
    <RoomTransitionContext.Provider value={{ playIn }}>
      {children}
      <div
        ref={overlayRef}
        className={styles.overlay}
        data-covered={covered}
        aria-hidden="true"
      >
        <span className={styles.mark}>IPC · 75</span>
      </div>
    </RoomTransitionContext.Provider>
  );
}
