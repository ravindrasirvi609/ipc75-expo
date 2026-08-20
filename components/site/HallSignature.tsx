"use client";

import { useRef } from "react";
import {
  AISLE_PATHS,
  BLOCKED_CELLS,
  HALL_RECT,
  LUNCHEON_RECT,
  STALLS,
  VIEW_BOX,
} from "@/lib/hall-1c-plan";
import { gsap, prefersReducedMotion, useGSAP } from "@/components/motion/gsap-init";

/**
 * The hero's signature: Hall 1C drawing itself in gold hairline.
 *
 * Not decoration — this is the surveyed plan at true proportions, the same
 * verified geometry the bookable plan uses, with the stalls that are actually
 * gone rendered as gone. The first thing a visitor sees is the floor they are
 * being asked to buy into, and how much of it is left.
 */
export default function HallSignature({ taken = [] }: { taken?: string[] }) {
  const scope = useRef<SVGSVGElement>(null);
  const sold = new Set(taken);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const frame = scope.current?.querySelectorAll("[data-frame]");
      const cells = scope.current?.querySelectorAll("[data-cell]");
      if (!frame || !cells) return;

      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
      timeline
        .from(frame, { opacity: 0, duration: 0.7, stagger: 0.12 })
        .from(
          cells,
          {
            opacity: 0,
            scale: 0.72,
            transformOrigin: "center",
            duration: 0.5,
            stagger: { each: 0.0042, from: "start" },
          },
          0.25,
        );
    },
    { scope },
  );

  return (
    <svg
      ref={scope}
      className="hall-signature"
      viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
      role="img"
      aria-label={`Surveyed plan of ${STALLS.length} stalls in Hall 1C, of which ${sold.size} are taken`}
    >
      <rect
        data-frame=""
        className="hs-wall"
        x={HALL_RECT.x}
        y={HALL_RECT.y}
        width={HALL_RECT.w}
        height={HALL_RECT.h}
      />
      <rect
        data-frame=""
        className="hs-zone"
        x={LUNCHEON_RECT.x}
        y={LUNCHEON_RECT.y}
        width={LUNCHEON_RECT.w}
        height={LUNCHEON_RECT.h}
      />
      {AISLE_PATHS.map((aisle, i) => (
        <path
          data-frame=""
          key={`aisle-${i}`}
          className="hs-aisle"
          d={aisle.d}
          strokeWidth={aisle.width}
        />
      ))}
      {STALLS.map((stall) => (
        <rect
          data-cell=""
          key={stall.id}
          className={sold.has(stall.id) ? "hs-cell is-taken" : "hs-cell"}
          x={stall.x}
          y={stall.y}
          width={stall.w}
          height={stall.h}
        />
      ))}
      {BLOCKED_CELLS.map((cell, i) => (
        <rect
          data-cell=""
          key={`blocked-${i}`}
          className="hs-cell is-blocked"
          x={cell.x}
          y={cell.y}
          width={cell.w}
          height={cell.h}
        />
      ))}
    </svg>
  );
}
