import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import SplitLines from "@/components/motion/SplitLines";
import {
  RATE_UNIT,
  SPACE_TYPES,
  STALL_MODULE,
  rupees,
} from "@/lib/expo-content";
import { STALLS } from "@/lib/hall-1c-plan";

export default function ChargesBand({ available }: { available: number }) {
  return (
    <section className="band band-floor charges" id="charges">
      <div className="shell">
        <div className="charges-head">
          <div>
            <p className="eyebrow">Participation charges</p>
            <SplitLines as="h2" className="display-l">
              Two ways to take space.
            </SplitLines>
          </div>
          <p className="lede">
            Both are priced per square metre before tax. A single stand is{" "}
            {STALL_MODULE.size} — {STALL_MODULE.area} sqm — and stands can be
            combined into blocks on the plan.
          </p>
        </div>

        <Reveal className="rate-row" stagger={0.12}>
          {SPACE_TYPES.map((space) => (
            <article className="rate-card" key={space.id}>
              <header>
                <h3 className="display-m">{space.name}</h3>
                <p className="rate-figure">
                  {rupees(space.rate)}
                  <span>{RATE_UNIT}</span>
                </p>
              </header>
              <p className="rate-summary">{space.summary}</p>
              <p className="rate-detail">{space.detail}</p>
              <p className="rate-module">
                <span className="data-label">One stand</span>
                {rupees(space.rate * STALL_MODULE.area)} + taxes
              </p>
            </article>
          ))}
        </Reveal>

        <div className="charges-foot">
          <p className="charges-note">
            {available} of {STALLS.length} stands in Hall 1C are still open. Pick
            yours on the plan and the exhibition desk will confirm and invoice.
          </p>
          <div className="charges-actions">
            <Link className="btn btn-primary" href="/floor-plan">
              Choose stands
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
