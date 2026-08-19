"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { registerGsap, ScrollTrigger } from "@/lib/animation/gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useIsTouchDevice } from "@/lib/hooks/useIsTouchDevice";
import styles from "./HeroScene.module.css";

function Fallback() {
  return (
    <div className={styles.fallback}>
      <div className={styles.glow} />
    </div>
  );
}

const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
  loading: Fallback,
});

type PointerState = { x: number; y: number };

export function HeroScene({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();
  const pointerRef = useRef<PointerState>({ x: 0, y: 0 });
  const velocityRef = useRef(0);

  const active = !reducedMotion && !isTouch;

  useEffect(() => {
    if (!active) return;
    registerGsap();

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -((event.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener("pointermove", onPointerMove);

    const trigger = ScrollTrigger.create({
      onUpdate: (self) => {
        velocityRef.current = self.getVelocity() / 2000;
      },
    });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      trigger.kill();
    };
  }, [active]);

  return (
    <div className={`${styles.wrap} ${className ?? ""}`} aria-hidden="true">
      {active ? (
        <SceneCanvas pointerRef={pointerRef} velocityRef={velocityRef} />
      ) : (
        <Fallback />
      )}
    </div>
  );
}
