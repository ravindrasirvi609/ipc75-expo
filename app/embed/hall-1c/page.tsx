import type { Metadata } from "next";
import PlanWidget from "@/components/floor-plan/PlanWidget";
import { parseStallParam } from "@/lib/stall-params";
import { getPublicStates } from "@/lib/stall-bookings";

export const metadata: Metadata = {
  title: "Hall 1C floor plan — 75th IPC",
  description:
    "Interactive stall plan for Hall 1C at the 75th Indian Pharmaceutical Congress, IICC.",
  // This route exists to be framed by other pages, not to rank on its own.
  robots: { index: false, follow: false },
};

/**
 * The iframe target. Deliberately chrome-free: no site nav, no hero, nothing
 * but the widget, so one <iframe> gives a host page the whole booking flow.
 *
 *   /embed/hall-1c              light
 *   /embed/hall-1c?theme=dark   dark
 *   /embed/hall-1c?stall=1C-12  opens zoomed onto a stall, preselected
 */
export default async function EmbedHall1CPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; stall?: string }>;
}) {
  const [{ theme, stall }, availability] = await Promise.all([
    searchParams,
    getPublicStates(),
  ]);

  return (
    <PlanWidget
      variant="embed"
      theme={theme === "dark" ? "dark" : "light"}
      availability={availability.stalls}
      initialSelection={parseStallParam(stall, availability.stalls)}
    />
  );
}
