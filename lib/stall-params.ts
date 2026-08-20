import { isStallId } from "./hall-1c-plan";
import {
  MAX_STALLS_PER_REQUEST,
  type PublicStallState,
} from "./stall-bookings";

/**
 * Reads a `?stall=1C-12,1C-11` deep link into a preselection.
 *
 * Runs on the server so the plan renders already zoomed in and preselected,
 * with no client-side correction pass. Unknown ids and stalls that are already
 * taken are dropped rather than rejected - a stale link should still open.
 */
export function parseStallParam(
  value: string | undefined,
  taken: PublicStallState[] = [],
): string[] {
  if (!value) return [];
  const unavailable = new Set(taken.map((entry) => entry.id));
  const ids = value
    .split(",")
    .map((id) => id.trim().toUpperCase())
    .filter((id) => isStallId(id) && !unavailable.has(id));
  return [...new Set(ids)].slice(0, MAX_STALLS_PER_REQUEST);
}
