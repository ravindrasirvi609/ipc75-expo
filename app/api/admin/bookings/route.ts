import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isStallId } from "@/lib/hall-1c-plan";
import { isOrganiser as organiser } from "@/lib/admin-auth";
import {
  DETAIL_FIELDS,
  isPaymentStatus,
  type DetailField,
} from "@/lib/booking-admin";

const BASE_COLUMNS =
  "stall_id,status,company,contact,email,phone,address,city,state,gst_number,note,requested_at,updated_at";
const PAYMENT_COLUMNS = "payment_status,payment_reference";
const MIGRATION_HINT =
  "Payment tracking needs the latest database migration (supabase/migrations/20261111000000_stall_booking_payment.sql).";

const unauthorised = () =>
  Response.json({ message: "Organiser access required." }, { status: 401 });
const unreachable = () =>
  Response.json(
    { message: "Could not reach the booking system. Try again shortly." },
    { status: 503 },
  );
const bad = (message: string) => Response.json({ message }, { status: 400 });

/** True when Postgres/PostgREST is complaining that the payment columns don't exist yet. */
const missingPaymentColumns = (error: { code?: string; message: string }) =>
  error.code === "42703" ||
  error.code === "PGRST204" ||
  /payment_(status|reference)/.test(error.message);

export async function GET(request: Request) {
  try {
    if (!(await organiser(request))) return unauthorised();
    const table = () => getSupabaseAdmin().from("stall_bookings");
    const full = await table()
      .select(`${BASE_COLUMNS},${PAYMENT_COLUMNS}`)
      .order("updated_at", { ascending: false });
    if (!full.error)
      return Response.json(
        { bookings: full.data ?? [], paymentTracking: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    if (!missingPaymentColumns(full.error))
      return Response.json({ message: full.error.message }, { status: 500 });

    // The payment migration hasn't been applied: keep the desk usable without it.
    const base = await table()
      .select(BASE_COLUMNS)
      .order("updated_at", { ascending: false });
    if (base.error)
      return Response.json({ message: base.error.message }, { status: 500 });
    return Response.json(
      {
        bookings: (base.data ?? []).map((row) => ({
          ...row,
          payment_status: "pending",
          payment_reference: null,
        })),
        paymentTracking: false,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return unreachable();
  }
}

/**
 * One of four changes, applied to every stall in `stallIds` (an organisation's
 * stalls), or to the single `stallId`:
 *  - `{ status }`                         confirm / return to hold
 *  - `{ action: "release" }`              delete holds, freeing the stalls
 *  - `{ paymentStatus, paymentReference }` record payment
 *  - `{ details }`                        edit the organisation's information
 */
export async function PATCH(request: Request) {
  try {
    if (!(await organiser(request))) return unauthorised();
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    const rawIds = Array.isArray(body.stallIds) ? body.stallIds : [body.stallId];
    const stallIds = [
      ...new Set(
        rawIds
          .filter((id): id is string => typeof id === "string")
          .map((id) => id.trim()),
      ),
    ];
    if (!stallIds.length || !stallIds.every(isStallId))
      return bad("Invalid stall.");

    const table = getSupabaseAdmin().from("stall_bookings");
    const now = new Date().toISOString();

    if (body.action === "release") {
      const { error } = await table
        .delete()
        .in("stall_id", stallIds)
        .eq("status", "hold");
      if (error)
        return Response.json({ message: error.message }, { status: 500 });
      return Response.json({ ok: true });
    }

    let changes: Record<string, string | null>;
    if (body.status === "booked" || body.status === "hold") {
      changes = { status: body.status };
    } else if (body.paymentStatus !== undefined) {
      if (!isPaymentStatus(body.paymentStatus))
        return bad("Invalid payment status.");
      const reference =
        typeof body.paymentReference === "string"
          ? body.paymentReference.trim().slice(0, 120)
          : "";
      changes = {
        payment_status: body.paymentStatus,
        payment_reference: reference || null,
      };
    } else if (body.details && typeof body.details === "object") {
      const input = body.details as Record<string, unknown>;
      changes = {};
      for (const field of Object.keys(DETAIL_FIELDS) as DetailField[]) {
        if (typeof input[field] !== "string") continue;
        const value = (input[field] as string)
          .trim()
          .slice(0, DETAIL_FIELDS[field]);
        changes[field] = value || null;
      }
      if (!Object.keys(changes).length) return bad("Nothing to update.");
      if ("company" in changes && !changes.company)
        return bad("Company name is required.");
      if (changes.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(changes.email))
        return bad("That email address looks wrong.");
    } else {
      return bad("Nothing to update.");
    }

    const { error } = await table
      .update({ ...changes, updated_at: now })
      .in("stall_id", stallIds);
    if (error) {
      if ("payment_status" in changes && missingPaymentColumns(error))
        return Response.json({ message: MIGRATION_HINT }, { status: 409 });
      return Response.json({ message: error.message }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch {
    return unreachable();
  }
}
