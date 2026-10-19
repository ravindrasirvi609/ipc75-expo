import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isOrganiser } from "@/lib/admin-auth";
import { buildAuthorEmail, LOGO_CID } from "@/lib/author-email";
import { buildAcceptancePdf, letterDate } from "@/lib/author-pdf";
import { readAsset } from "@/lib/server-assets";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Sends the acceptance email, with its personalised PDF, to authors — one
 * round per request.
 *
 * Resend's batch endpoint doesn't accept attachments, so each email is its
 * own call, and the default limit is 2 calls a second. A round therefore
 * handles a bounded number of authors; the desk keeps calling until
 * `remaining` is 0, so it is still one click for the organiser.
 *
 * The first call has no `since`; the server picks one (its own clock, never
 * the browser's) and returns it. Every later call passes it back, and only
 * authors not yet attempted since then are picked up. Each author is stamped
 * as attempted whether the send worked or not, so the run always finishes
 * and nobody is emailed twice by one click.
 */

const RESEND = "https://api.resend.com/emails";
const ROUND_SIZE = 20;
const PAUSE_MS = 550;
const TIME_BUDGET_MS = 45_000;
const SELECT = "id,author_name,paper_code,poster_code,email,title";

type Recipient = {
  id: string;
  author_name: string;
  paper_code: string | null;
  poster_code: string | null;
  email: string;
  title: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const base64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");

/** One round at a time per server, so a double click can't email anyone twice. */
let running = false;

/** The two filter methods `eligible` needs, which Supabase's builders share. */
type Filterable<Q> = {
  or(filters: string): Q;
  is(column: string, value: null): Q;
};

async function sendOne(
  apiKey: string,
  body: unknown,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(RESEND, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true };
    if (response.status === 429 && attempt < 2) {
      await sleep(1200);
      continue;
    }
    const error = await response.json().catch(() => ({}));
    return {
      ok: false,
      status: response.status,
      message: error?.message ?? `Resend returned ${response.status}.`,
    };
  }
  return { ok: false, status: 429, message: "Resend rate limit reached." };
}

export async function POST(request: Request) {
  try {
    if (!(await isOrganiser(request)))
      return Response.json(
        { message: "Organiser access required." },
        { status: 401 },
      );

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    if (!apiKey || !from)
      return Response.json(
        {
          message:
            "Email is not set up. Add RESEND_API_KEY and RESEND_FROM to the server environment.",
        },
        { status: 503 },
      );

    const input = await request.json().catch(() => ({}));
    const resendAll = input?.resend === true;

    const startedAt = Date.now();
    let since = new Date(startedAt);
    if (typeof input?.since === "string") {
      const parsed = new Date(input.since);
      if (Number.isNaN(parsed.getTime()) || parsed.getTime() > startedAt + 60_000)
        return Response.json({ message: "Invalid run marker." }, { status: 400 });
      since = parsed;
    }
    const sinceIso = since.toISOString();

    if (running)
      return Response.json(
        { message: "A send is already in progress. Wait for it to finish." },
        { status: 409 },
      );
    running = true;

    try {
      const db = getSupabaseAdmin();
      // The same filters apply to the page of authors and to the count left.
      const eligible = <Q extends Filterable<Q>>(query: Q): Q => {
        const q = query.or(
          `email_attempted_at.is.null,email_attempted_at.lt.${sinceIso}`,
        );
        return resendAll ? q : q.is("emailed_at", null);
      };

      const { data, error } = await eligible(
        db.from("authors").select(SELECT),
      )
        .order("serial_no", { ascending: true, nullsFirst: false })
        .limit(ROUND_SIZE);
      if (error)
        return Response.json({ message: error.message }, { status: 500 });
      const recipients = (data ?? []) as unknown as Recipient[];

      let sent = 0;
      let failed = 0;
      let aborted = "";
      const errors: string[] = [];

      if (recipients.length) {
        const logo = base64(await readAsset("ipc-logo.jpg"));
        const date = letterDate();

        for (const [n, r] of recipients.entries()) {
          if (Date.now() - startedAt > TIME_BUDGET_MS) break;
          if (n > 0) await sleep(PAUSE_MS);

          const attempt = new Date().toISOString();
          let outcome: { ok: true } | { ok: false; status: number; message: string };
          try {
            const mail = buildAuthorEmail(r);
            const pdf = await buildAcceptancePdf(r, date);
            const code = (r.paper_code ?? r.poster_code ?? "abstract").replace(
              /[^A-Za-z0-9._-]+/g,
              "_",
            );
            outcome = await sendOne(apiKey, {
              from,
              to: [r.email],
              subject: mail.subject,
              html: mail.html,
              text: mail.text,
              ...(process.env.RESEND_REPLY_TO
                ? { reply_to: process.env.RESEND_REPLY_TO }
                : {}),
              attachments: [
                {
                  filename: `Abstract-Acceptance-${code}.pdf`,
                  content: base64(pdf),
                  content_type: "application/pdf",
                },
                {
                  filename: "ipc-logo.jpg",
                  content: logo,
                  content_type: "image/jpeg",
                  content_id: LOGO_CID,
                },
              ],
            });
          } catch (e) {
            outcome = {
              ok: false,
              status: 0,
              message: e instanceof Error ? e.message : "Could not build the email.",
            };
          }

          const { error: saveError } = await db
            .from("authors")
            .update(
              outcome.ok
                ? { emailed_at: attempt, email_error: null, email_attempted_at: attempt }
                : {
                    email_error: outcome.message.slice(0, 300),
                    email_attempted_at: attempt,
                  },
            )
            .eq("id", r.id);

          if (outcome.ok) sent++;
          else {
            failed++;
            if (errors.length < 10) errors.push(`${r.email}: ${outcome.message}`);
          }
          if (saveError) {
            aborted = `Emails are going out but the database could not record them (${saveError.message}). Stopped to avoid sending twice.`;
            break;
          }
          // A bad key or unverified sender fails every email the same way.
          if (!outcome.ok && [401, 403].includes(outcome.status)) {
            aborted = outcome.message;
            break;
          }
        }
      }

      const { count } = await eligible(
        db.from("authors").select("id", { count: "exact", head: true }),
      );

      return Response.json({
        ok: !aborted && failed === 0,
        since: sinceIso,
        processed: sent + failed,
        sent,
        failed,
        remaining: count ?? 0,
        errors,
        ...(aborted ? { aborted } : {}),
      });
    } finally {
      running = false;
    }
  } catch {
    return Response.json(
      { message: "Could not reach the email or author service. Try again shortly." },
      { status: 503 },
    );
  }
}
