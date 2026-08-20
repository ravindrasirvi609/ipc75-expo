"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Backdrop as BackdropData } from "@/lib/media";
import { gsap, prefersReducedMotion, useGSAP } from "@/components/motion/gsap-init";
import { useVideoAllowed } from "./useVideoAllowed";
import "./backdrop.css";

type BackdropProps = {
  /** Resolved on the server. `null` renders nothing at all. */
  media: BackdropData | null;
  /** Scrim colour: navy over dark bands, paper over light ones. */
  tone: "navy" | "paper";
  /**
   * How much of the picture shows through, 0–1. Dense text needs a low number —
   * these are textures behind copy, not photographs to look at.
   */
  opacity?: number;
  /** Load eagerly. Use only for the hero, never below the fold. */
  priority?: boolean;
  /** Drift the image slowly as the section passes. */
  parallax?: boolean;
  /** Position for art direction, e.g. "50% 30%". */
  focus?: string;
};

/**
 * Optional background media for a section.
 *
 * Video only ever plays when it is worth the bytes and the visitor has not asked
 * otherwise: muted, looping, and skipped entirely on narrow screens, on metered
 * connections and under `prefers-reduced-motion`, where the poster still shows
 * instead. A scrim always sits on top so the copy's contrast never depends on
 * what the picture happens to contain.
 */
export default function Backdrop({
  media,
  tone,
  opacity = 0.16,
  priority = false,
  parallax = false,
  focus = "50% 50%",
}: BackdropProps) {
  const scope = useRef<HTMLDivElement>(null);
  const videoAllowed = useVideoAllowed();
  const playVideo = videoAllowed && Boolean(media?.videos.length);

  useGSAP(
    () => {
      if (!parallax || !media || prefersReducedMotion()) return;
      const layer = scope.current?.querySelector("[data-parallax]");
      if (!layer) return;

      gsap.fromTo(
        layer,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope, dependencies: [parallax, media] },
  );

  if (!media) return null;

  return (
    <div ref={scope} className={`backdrop tone-${tone}`} aria-hidden="true">
      <div
        className="backdrop-layer"
        data-parallax=""
        style={{ "--backdrop-opacity": opacity } as React.CSSProperties}
      >
        {media.image ? (
          <Image
            src={media.image}
            alt=""
            fill
            priority={priority}
            quality={68}
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: focus }}
          />
        ) : null}

        {playVideo ? (
          <video
            className="backdrop-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={media.image}
            style={{ objectPosition: focus }}
          >
            {media.videos.map((src) => (
              <source
                key={src}
                src={src}
                type={src.endsWith(".webm") ? "video/webm" : "video/mp4"}
              />
            ))}
          </video>
        ) : null}
      </div>
      <div className="backdrop-scrim" />
    </div>
  );
}
