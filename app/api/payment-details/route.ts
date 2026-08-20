import { getBankDetails } from "@/lib/finance";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/** Never cache a response that depends on who asked. */
export const dynamic = "force-dynamic";

/**
 * Returns the bank account details, and only ever by POST.
 *
 * The point of the gate is that the account number never appears in a page a
 * crawler can index or a fraudster can clone with their own account swapped in.
 * GET is therefore refused outright, not redirected to the data.
 */
export function GET() {
  return Response.json(
    {
      ok: false,
      message:
        "Bank details are issued on request. Submit the form on the contact page, or email expo@75thipc.com.",
    },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } },
  );
}

const REQUESTS_PER_HOUR = 10;

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const limit = rateLimit(
    `payment:${clientKey(request)}`,
    REQUESTS_PER_HOUR,
    60 * 60 * 1000,
  );
  if (!limit.ok) {
    return Response.json(
      {
        ok: false,
        message: "Too many requests from here. Email expo@75thipc.com and the team will send them.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Expected a JSON body." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const company = text(payload.company, 120);
  const email = text(payload.email, 160);

  if (!company || !email) {
    return Response.json(
      { ok: false, message: "Company and email are both needed." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json(
      { ok: false, message: "That email address looks wrong." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { ok: true, bank: getBankDetails() },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
