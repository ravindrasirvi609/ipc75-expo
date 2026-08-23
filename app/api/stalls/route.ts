import {
  getPublicStates,
  requestHold,
  MAX_STALLS_PER_REQUEST,
} from "@/lib/stall-bookings";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/** Availability changes on every request - never serve a cached snapshot. */
export const dynamic = "force-dynamic";

/**
 * Allows the embeddable widget to be served from another origin.
 * Tighten `Access-Control-Allow-Origin` to your own hosts before going live.
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { ...CORS, "Cache-Control": "no-store" },
  });

export async function GET() {
  try {
    const states = await getPublicStates();
    return json(states);
  } catch {
    return json(
      {
        message:
          "Availability is temporarily unavailable. Please try again shortly.",
      },
      503,
    );
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/**
 * The form is public and embeddable, so throttle it: a genuine exhibitor sends
 * one or two requests, and this stops a script quietly holding the whole hall.
 */
const HOLDS_PER_HOUR = 5;

export async function POST(request: Request) {
  const limit = rateLimit(
    `hold:${clientKey(request)}`,
    HOLDS_PER_HOUR,
    60 * 60 * 1000,
  );
  if (!limit.ok) {
    return Response.json(
      {
        ok: false,
        reason: "rate-limited",
        message:
          "Too many requests from here. Try again shortly, or email exhibition@ipc75.com.",
      },
      {
        status: 429,
        headers: {
          ...CORS,
          "Cache-Control": "no-store",
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(
      { ok: false, reason: "invalid", message: "Expected a JSON body." },
      400,
    );
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const stalls = Array.isArray(payload.stalls)
    ? payload.stalls
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
    : [];
  const company = text(payload.company, 120);
  const contact = text(payload.contact, 120);
  const email = text(payload.email, 160);
  const phone = text(payload.phone, 40);
  const note = text(payload.note, 500);

  if (!company || !contact || !email) {
    return json(
      {
        ok: false,
        reason: "invalid",
        message: "Company, contact name and email are required.",
      },
      400,
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json(
      {
        ok: false,
        reason: "invalid",
        message: "That email address looks wrong.",
      },
      400,
    );
  }
  if (stalls.length > MAX_STALLS_PER_REQUEST) {
    return json(
      {
        ok: false,
        reason: "invalid",
        message: `A single request can cover at most ${MAX_STALLS_PER_REQUEST} stalls.`,
      },
      400,
    );
  }

  try {
    const result = await requestHold({
      stalls,
      company,
      contact,
      email,
      phone,
      note,
    });
    if (result.ok) return json(result, 201);
    return json(result, result.reason === "conflict" ? 409 : 400);
  } catch {
    return json(
      {
        ok: false,
        reason: "unavailable",
        message:
          "Could not reach the booking system — try again shortly, or email exhibition@ipc75.com.",
      },
      503,
    );
  }
}
