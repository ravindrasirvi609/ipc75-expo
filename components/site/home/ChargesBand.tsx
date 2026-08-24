import Link from "next/link";
import { ArrowRight, Banknote, Package, Warehouse } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SplitLines from "@/components/motion/SplitLines";
import Backdrop from "@/components/media/Backdrop";
import type { Backdrop as BackdropData } from "@/lib/media";
import {
  RATE_UNIT,
  SPACE_TYPES,
  STALL_MODULE,
  rupees,
} from "@/lib/expo-content";
import { STALLS } from "@/lib/hall-1c-plan";

export default function ChargesBand({
  available,
  backdrop,
}: {
  /** `null` when live availability couldn't be read — never show it as zero taken. */
  available: number | null;
  backdrop: BackdropData | null;
}) {
  return (
    <section className="band band-floor charges has-backdrop" id="charges">
      {/* The rate cards still carry the numbers; the picture now reads clearly behind them. */}
      <Backdrop media={backdrop} tone="navy" opacity={0.42} />
      <div className="shell">
        <div className="charges-head">
          <div>
            <p className="eyebrow">
              <Banknote size={13} strokeWidth={1.75} aria-hidden="true" />
              Participation charges
            </p>
            <SplitLines as="h2" className="display-l">
              Two ways to take space.
            </SplitLines>
          </div>
          <p className="lede">
            Both are priced per square metre before tax. A single stall is{" "}
            {STALL_MODULE.size} — {STALL_MODULE.area} sqm — and stalls can be
            combined into blocks on the plan.
          </p>
        </div>

        <Reveal className="rate-row" stagger={0.12}>
          {SPACE_TYPES.map((space) => {
            const SpaceIcon = space.id === "shell" ? Package : Warehouse;
            return (
              <article className="rate-card" key={space.id}>
                <header>
                  <h3 className="display-m">
                    <SpaceIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                    {space.name}
                  </h3>
                  <p className="rate-figure">
                    {rupees(space.rate)}
                    <span>{RATE_UNIT}</span>
                  </p>
                </header>
                <p className="rate-summary">{space.summary}</p>
                <p className="rate-detail">{space.detail}</p>
                <p className="rate-module">
                  <span className="data-label">One stall</span>
                  {rupees(space.rate * STALL_MODULE.area)} + taxes
                </p>
              </article>
            );
          })}
        </Reveal>

        <div className="charges-foot">
          <p className="charges-note">
            {available === null
              ? "Live stall availability is temporarily unavailable — the exhibition desk can confirm what's open."
              : `${available} of ${STALLS.length} stalls in Hall 1C are still open.`}{" "}
            Pick yours on the plan and the exhibition desk will confirm and
            invoice.
          </p>
          <div className="charges-actions">
            <Link className="btn btn-primary" href="/floor-plan">
              Choose stalls
              <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
            </Link>
            <Link className="btn btn-ghost" href="/exhibit">
              Work out the cost
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
