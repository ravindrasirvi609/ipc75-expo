"use client";

import Link from "next/link";
import SplitLines from "@/components/motion/SplitLines";
import Reveal from "@/components/motion/Reveal";
import HallSignature from "@/components/site/HallSignature";
import Backdrop from "@/components/media/Backdrop";
import type { Backdrop as BackdropData } from "@/lib/media";
import { EVENT, STALL_MODULE, VENUE } from "@/lib/expo-content";
import { STALLS } from "@/lib/hall-1c-plan";

export default function Hero({
  taken,
  unavailable = false,
  backdrop,
}: {
  taken: string[];
  /** True when live availability couldn't be read — never show it as zero taken. */
  unavailable?: boolean;
  backdrop: BackdropData | null;
}) {
  const available = unavailable ? null : STALLS.length - taken.length;

  return (
    <section className="hero band-deep has-backdrop" id="top">
      {/* Atmosphere only — the hall plan stays the focal point of this section. */}
      <Backdrop media={backdrop} tone="navy" opacity={0.2} priority parallax={false} />
      <div className="hero-grid shell">
        <div className="hero-copy">
          <p className="eyebrow">
            {EVENT.parent} · {EVENT.milestone}
          </p>

          <SplitLines as="h1" className="display-xl hero-title" onLoad delay={0.15}>
            {EVENT.name}
          </SplitLines>

          <Reveal className="hero-body" delay={0.5} distance={18}>
            <p className="lede">{EVENT.subtitle}</p>
            <div className="hero-chips">
              <span className="chip">{EVENT.dates.label}</span>
              <span className="chip">
                {VENUE.name}, {VENUE.city}
              </span>
              <span className="chip">{VENUE.hall}</span>
            </div>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/floor-plan">
                Book a stall
              </Link>
              <Link className="btn btn-ghost" href="/exhibit">
                See charges
              </Link>
            </div>
          </Reveal>
        </div>

        <figure className="hero-plan">
          <HallSignature taken={taken} />
          <figcaption>
            <span className="data-label">{VENUE.hall} · surveyed plan</span>
            {available === null ? (
              <p>Live availability is temporarily unavailable.</p>
            ) : (
              <p>
                <b>{available}</b> of {STALLS.length} stalls available
              </p>
            )}
            <p className="hero-plan-module">
              {STALL_MODULE.size} · {STALL_MODULE.area} sqm each
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
