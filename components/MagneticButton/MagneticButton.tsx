"use client";

import { useRef, type MouseEvent } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useIsTouchDevice } from "@/lib/hooks/useIsTouchDevice";
import styles from "./MagneticButton.module.css";

type MagneticButtonProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Multiplier applied to the raw cursor offset from the wrapper's center.
   * Higher values pull the element further toward the cursor.
   */
  strength?: number;
};

// Hard ceiling on translation so the effect stays restrained (premium, not
// gimmicky) regardless of how large the wrapped element is.
const MAX_TRANSLATE = 16;

function clamp(value: number, max: number) {
  return Math.min(Math.max(value, -max), max);
}

export function MagneticButton({ children, className, strength = 0.35 }: MagneticButtonProps) {
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [{ x, y }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { tension: 300, friction: 20 },
  }));

  // Magnetic hover makes no sense on touch input and must respect reduced
  // motion preferences — render children directly with no wrapper/listeners.
  if (reducedMotion || isTouch) {
    return <>{children}</>;
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = wrapperRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const offsetX = event.clientX - (bounds.left + bounds.width / 2);
    const offsetY = event.clientY - (bounds.top + bounds.height / 2);

    api.start({
      x: clamp(offsetX * strength, MAX_TRANSLATE),
      y: clamp(offsetY * strength, MAX_TRANSLATE),
    });
  };

  const handleMouseLeave = () => {
    api.start({ x: 0, y: 0 });
  };

  return (
    <animated.div
      ref={wrapperRef}
      className={className ? `${styles.wrapper} ${className}` : styles.wrapper}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </animated.div>
  );
}
