import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import EmbedSnippet from "@/components/floor-plan/EmbedSnippet";
import PlanWidget from "@/components/floor-plan/PlanWidget";
import { SECTIONS, STALLS } from "@/lib/hall-1c-plan";
import { getPublicStates } from "@/lib/stall-bookings";
import { parseStallParam } from "@/lib/stall-params";

export const metadata: Metadata = {
  title: "Hall 1C floor plan — 75th IPC",
  description:
    "Explore the Hall 1C stall layout at the 75th Indian Pharmaceutical Congress and request your stand.",
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

  const bySection = SECTIONS.map((section) => ({
    section,
    count: STALLS.filter((s) => s.section === section).length,
  }));

  return (
    <main className="plan-page">
      <header className="plan-nav">
        <Link className="brand" href="/">
          <span>IPC</span>
          <i>75</i>
        </Link>
        <div>
          75th Indian Pharmaceutical Congress <b>IICC · HALL 1C</b>
        </div>
        <a className="plan-book" href="mailto:exhibition@ipc75.com">
          Talk to the team ↗
        </a>
      </header>

      <section className="plan-hero">
        <div>
          <p className="eyebrow coral">Interactive exhibition floor plan</p>
          <h1>
            FIND YOUR
            <br />
            <em>FOOTPRINT.</em>
          </h1>
          <p>
            The Hall 1C layout, drawn to the surveyed grid. Pick the stalls you
            want and request them — availability updates for everyone.
          </p>
        </div>
        <div className="plan-meta">
          <span>{STALLS.length} STALLS / 3M × 3M</span>
          {bySection.map(({ section, count }) => (
            <span key={section}>
              {section} — {count}
            </span>
          ))}
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

      <div className="plan-stage">
        <EmbedSnippet origin={origin} />
      </div>
    </main>
  );
}
