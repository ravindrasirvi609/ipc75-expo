import type { Metadata } from "next";
import { headers } from "next/headers";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import EmbedSnippet from "@/components/floor-plan/EmbedSnippet";
import PlanWidget from "@/components/floor-plan/PlanWidget";
import SplitLines from "@/components/motion/SplitLines";
import { EVENT, SPACE_TYPES, STALL_MODULE, VENUE, rupees } from "@/lib/expo-content";
import { SECTIONS, STALLS } from "@/lib/hall-1c-plan";
import { getPublicStates } from "@/lib/stall-bookings";
import { parseStallParam } from "@/lib/stall-params";
import "@/components/site/site.css";
import "@/components/site/home/home.css";
import "../exhibit/exhibit.css";
import "./floor-plan.css";

export const metadata: Metadata = {
  title: `${VENUE.hall} floor plan — ${EVENT.name}`,
  description: `Interactive stall plan for ${VENUE.hall} at ${VENUE.name}. Pick your stalls and request them online.`,
};

/** Public origin of this request, so the embed snippet is copy-paste correct. */
async function requestOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return "https://your-domain.example";
  const proto =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function FloorPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ stall?: string }>;
}) {
  const [{ stall }, availability, origin] = await Promise.all([
    searchParams,
    getPublicStates(),
    requestOrigin(),
  ]);

  const available = STALLS.length - availability.stalls.length;
  const bySection = SECTIONS.map((section) => ({
    section,
    count: STALLS.filter((s) => s.section === section).length,
  }));

  return (
    <>
      <SiteHeader solid />
      <main className="head-offset">
        <section className="band band-deep page-lead plan-lead">
          <div className="shell plan-lead-grid">
            <div>
              <p className="eyebrow">{VENUE.hall} · surveyed plan</p>
              <SplitLines as="h1" className="display-xl page-title" onLoad delay={0.1}>
                Pick your stalls.
              </SplitLines>
              <p className="lede page-lede">
                Every stall is {STALL_MODULE.size} — {STALL_MODULE.area} sqm. Click
                the ones you want, send the request, and they go on hold while the
                desk confirms. {available} of {STALLS.length} are open right now.
              </p>
            </div>
            <dl className="plan-key">
              {bySection.map(({ section, count }) => (
                <div key={section}>
                  <dt className="data-label">Block {section}</dt>
                  <dd>{count} stalls</dd>
                </div>
              ))}
              <div>
                <dt className="data-label">From</dt>
                <dd>
                  {rupees(SPACE_TYPES[1].rate * STALL_MODULE.area)}
                  <span> / stall + taxes</span>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="plan-stage">
          <PlanWidget
            variant="page"
            theme="light"
            availability={availability.stalls}
            initialSelection={parseStallParam(stall, availability.stalls)}
          />
        </div>

        <section className="band band-sheet embed-band">
          <div className="shell">
            <EmbedSnippet origin={origin} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
