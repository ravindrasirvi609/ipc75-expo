import Counter from "@/components/motion/Counter";
import Reveal from "@/components/motion/Reveal";
import SplitLines from "@/components/motion/SplitLines";
import {
  EVENT,
  EXHIBITOR_PROFILE,
  STALL_MODULE,
  VISITOR_PROFILE,
} from "@/lib/expo-content";
import { STALLS } from "@/lib/hall-1c-plan";

/**
 * Every figure here is a fact from the brochure or the surveyed plan. No
 * attendance projections: the brochure publishes none, so neither does the site.
 */
const FIGURES = [
  { value: 75, suffix: "th", label: "Congress edition", note: EVENT.milestone },
  { value: EVENT.dates.dayCount, suffix: "", label: "Days on the floor", note: EVENT.dates.days },
  { value: STALLS.length, suffix: "", label: "Stalls in Hall 1C", note: `${STALL_MODULE.size} module` },
  {
    value: EXHIBITOR_PROFILE.length + VISITOR_PROFILE.length,
    suffix: "",
    label: "Industry categories",
    note: `${EXHIBITOR_PROFILE.length} exhibiting · ${VISITOR_PROFILE.length} visiting`,
  },
];

export default function WhyExhibit() {
  return (
    <section className="band band-sheet why" id="why">
      <div className="shell">
        <p className="eyebrow">Why exhibit</p>
        <SplitLines as="h2" className="display-l why-title">
          Your buyers are already coming for the congress.
        </SplitLines>
        <p className="lede why-lede">
          The exhibition sits inside the {EVENT.parent} — the Platinum Jubilee
          edition. Formulation heads, plant engineers, QC leads and procurement
          teams are in Dwarka for three days regardless. This is the hall where
          they specify equipment.
        </p>

        <Reveal className="figure-row" stagger={0.09}>
          {FIGURES.map((figure) => (
            <div className="figure-tile" key={figure.label}>
              <span className="figure-value">
                <Counter to={figure.value} suffix={figure.suffix} />
              </span>
              <span className="figure-label">{figure.label}</span>
              <span className="figure-note">{figure.note}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
