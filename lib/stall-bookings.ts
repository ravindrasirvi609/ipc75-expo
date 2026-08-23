/** Supabase-backed stall availability and atomic hold requests. */
import { isStallId } from "./hall-1c-plan";
import { MAX_STALLS_PER_REQUEST } from "./booking-limits";
import { getSupabaseAdmin } from "./supabase-admin";

export type StallStatus = "available" | "hold" | "booked";
export type StallRecord = { status: "hold" | "booked"; company?: string; contact?: string; email?: string; phone?: string; note?: string; requestedAt?: string };
export type PublicStallState = { id: string; status: "hold" | "booked"; company?: string };
export type HoldRequest = { stalls: string[]; company: string; contact: string; email: string; phone?: string; note?: string };
export { MAX_STALLS_PER_REQUEST };

type BookingRow = { stall_id: string; status: "hold" | "booked"; company: string | null; updated_at: string };

export async function getPublicStates(): Promise<{ updatedAt: string; stalls: PublicStallState[] }> {
  const { data, error } = await getSupabaseAdmin().from("stall_bookings").select("stall_id,status,company,updated_at").order("stall_id");
  if (error) throw new Error(`Could not read stall availability: ${error.message}`);
  const rows = (data ?? []) as BookingRow[];
  return {
    updatedAt: rows.reduce((latest, row) => row.updated_at > latest ? row.updated_at : latest, new Date(0).toISOString()),
    stalls: rows.map((row) => ({ id: row.stall_id, status: row.status, ...(row.company ? { company: row.company } : {}) })),
  };
}

export type PublicStatesResult = { updatedAt: string; stalls: PublicStallState[]; unavailable: boolean };

/**
 * Same as `getPublicStates`, but never throws. Pages that would otherwise
 * 500 on a Supabase hiccup call this instead and render a degraded state —
 * `unavailable: true` tells the caller the stall list is unknown, not empty,
 * so it must not be shown as "everything is free."
 */
export async function getPublicStatesSafely(): Promise<PublicStatesResult> {
  try {
    const result = await getPublicStates();
    return { ...result, unavailable: false };
  } catch {
    return { updatedAt: "", stalls: [], unavailable: true };
  }
}

export type HoldResult =
  | { ok: true; held: string[] }
  | { ok: false; reason: "conflict"; taken: PublicStallState[] }
  | { ok: false; reason: "invalid"; message: string };

export async function requestHold(request: HoldRequest): Promise<HoldResult> {
  const ids = [...new Set(request.stalls)];
  if (!ids.length) return { ok: false, reason: "invalid", message: "Select at least one stall." };
  if (ids.length > MAX_STALLS_PER_REQUEST) return { ok: false, reason: "invalid", message: `A single request can cover at most ${MAX_STALLS_PER_REQUEST} stalls.` };
  const unknown = ids.filter((id) => !isStallId(id));
  if (unknown.length) return { ok: false, reason: "invalid", message: `Not stalls in Hall 1C: ${unknown.join(", ")}.` };
  const { data, error } = await getSupabaseAdmin().rpc("request_stall_hold", {
    p_stalls: ids, p_company: request.company, p_contact: request.contact, p_email: request.email,
    p_phone: request.phone ?? "", p_note: request.note ?? "",
  });
  if (error) throw new Error(`Could not create stall hold: ${error.message}`);
  return data as HoldResult;
}
