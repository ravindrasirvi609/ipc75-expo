import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isOrganiser } from "@/lib/admin-auth";
import {
  LIST_LIMIT,
  MAX_BULK_ROWS,
  validateAuthor,
  type AuthorInput,
  type SaveResult,
} from "@/lib/authors";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const DENIED = { message: "Organiser access required." };
const UNREACHABLE = {
  message: "Could not reach the author database. Try again shortly.",
};

export async function GET(request: Request) {
  try {
    if (!(await isOrganiser(request)))
      return Response.json(DENIED, { status: 401 });
    const db = getSupabaseAdmin();
    const [list, pending] = await Promise.all([
      db
        .from("authors")
        .select(
          "id,serial_no,author_name,paper_code,poster_code,email,title,created_at,emailed_at,email_error",
          { count: "exact" },
        )
        .order("serial_no", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
        .limit(LIST_LIMIT),
      db
        .from("authors")
        .select("id", { count: "exact", head: true })
        .is("emailed_at", null),
    ]);
    if (list.error || pending.error)
      return Response.json(
        { message: (list.error ?? pending.error)!.message },
        { status: 500 },
      );
    return Response.json(
      {
        authors: list.data ?? [],
        total: list.count ?? list.data?.length ?? 0,
        pending: pending.count ?? 0,
      },
      { headers: NO_STORE },
    );
  } catch {
    return Response.json(UNREACHABLE, { status: 503 });
  }
}

/**
 * Saves one row (the entry form) or many (bulk upload) — same path, same
 * rules. Valid rows are saved even if others are rejected; every rejection
 * comes back with the index of the row it belongs to.
 */
export async function POST(request: Request) {
  try {
    if (!(await isOrganiser(request)))
      return Response.json(DENIED, { status: 401 });

    const body = await request.json().catch(() => null);
    const rows: unknown = body?.rows;
    if (!Array.isArray(rows) || rows.length === 0)
      return Response.json(
        { message: "Send at least one row." },
        { status: 400 },
      );
    if (rows.length > MAX_BULK_ROWS)
      return Response.json(
        { message: `Upload at most ${MAX_BULK_ROWS} rows at a time.` },
        { status: 400 },
      );

    const rejected: SaveResult["rejected"] = [];
    const candidates: { index: number; value: AuthorInput }[] = [];
    rows.forEach((raw, index) => {
      const result = validateAuthor(raw);
      if (result.ok) candidates.push({ index, value: result.value });
      else rejected.push({ index, message: result.message });
    });

    // Duplicates inside the upload: the first row wins.
    const seen = { paper: new Map<string, number>(), poster: new Map<string, number>() };
    const unique = candidates.filter(({ index, value }) => {
      for (const [kind, map, code] of [
        ["Paper", seen.paper, value.paperCode],
        ["Poster", seen.poster, value.posterCode],
      ] as const) {
        if (!code) continue;
        const first = map.get(code);
        if (first !== undefined) {
          rejected.push({
            index,
            message: `${kind} code ${code} is repeated in this upload`,
          });
          return false;
        }
        map.set(code, index);
      }
      return true;
    });

    // Duplicates of what is already saved.
    const db = getSupabaseAdmin();
    const paperCodes = unique.map((r) => r.value.paperCode).filter(Boolean);
    const posterCodes = unique.map((r) => r.value.posterCode).filter(Boolean);
    const [papers, posters] = await Promise.all([
      paperCodes.length
        ? db.from("authors").select("paper_code").in("paper_code", paperCodes)
        : { data: [], error: null },
      posterCodes.length
        ? db.from("authors").select("poster_code").in("poster_code", posterCodes)
        : { data: [], error: null },
    ]);
    if (papers.error || posters.error)
      return Response.json(UNREACHABLE, { status: 503 });
    const takenPapers = new Set(
      (papers.data ?? []).map((r) => (r as { paper_code: string }).paper_code),
    );
    const takenPosters = new Set(
      (posters.data ?? []).map((r) => (r as { poster_code: string }).poster_code),
    );
    const fresh = unique.filter(({ index, value }) => {
      if (value.paperCode && takenPapers.has(value.paperCode)) {
        rejected.push({
          index,
          message: `Paper code ${value.paperCode} already exists`,
        });
        return false;
      }
      if (value.posterCode && takenPosters.has(value.posterCode)) {
        rejected.push({
          index,
          message: `Poster code ${value.posterCode} already exists`,
        });
        return false;
      }
      return true;
    });

    let inserted = 0;
    if (fresh.length) {
      // Rows without an S. No. continue on from the highest one saved.
      const { data: top } = await db
        .from("authors")
        .select("serial_no")
        .not("serial_no", "is", null)
        .order("serial_no", { ascending: false })
        .limit(1);
      let next = (top?.[0]?.serial_no ?? 0) + 1;

      const { error } = await db.from("authors").insert(
        fresh.map(({ value }) => ({
          serial_no: value.serialNo ?? next++,
          author_name: value.authorName,
          paper_code: value.paperCode || null,
          poster_code: value.posterCode || null,
          email: value.email,
          title: value.title,
        })),
      );
      if (error) {
        // Lost a race with another save of the same code: nothing was written.
        const conflict = error.code === "23505";
        return Response.json(
          {
            ok: false,
            inserted: 0,
            rejected,
            message: conflict
              ? "A paper or poster code in this upload was just saved by someone else. Review the list and retry."
              : error.message,
          } satisfies SaveResult,
          { status: conflict ? 409 : 500 },
        );
      }
      inserted = fresh.length;
    }

    rejected.sort((a, b) => a.index - b.index);
    const result: SaveResult = {
      ok: inserted > 0,
      inserted,
      rejected,
      ...(inserted === 0 && rejected.length
        ? { message: rejected[0].message }
        : {}),
    };
    return Response.json(result, {
      status: inserted === 0 ? 422 : 200,
      headers: NO_STORE,
    });
  } catch {
    return Response.json(UNREACHABLE, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isOrganiser(request)))
      return Response.json(DENIED, { status: 401 });
    const id = new URL(request.url).searchParams.get("id") ?? "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
      return Response.json({ message: "Invalid author id." }, { status: 400 });
    const { error } = await getSupabaseAdmin()
      .from("authors")
      .delete()
      .eq("id", id);
    if (error)
      return Response.json({ message: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch {
    return Response.json(UNREACHABLE, { status: 503 });
  }
}
