/**
 * Server-side store for stall availability.
 *
 * Backed by a JSON file so the demo persists across restarts with no external
 * service. Everything the rest of the app touches goes through this module, so
 * swapping in Postgres/Supabase later means reimplementing `readStore` and
 * `writeStore` and nothing else.
 *
 * Note: a single JSON file assumes a single server process. It is not safe for
 * a multi-instance / serverless deployment - move to a real database first.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { isStallId } from "./hall-1c-plan";
import { MAX_STALLS_PER_REQUEST } from "./booking-limits";

export type StallStatus = "available" | "hold" | "booked";

/** What we keep about a taken stall. Contact fields never leave the server. */
export type StallRecord = {
  status: "hold" | "booked";
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  note?: string;
  requestedAt?: string;
};

/** The subset of a record that is safe to publish to any visitor. */
export type PublicStallState = {
  id: string;
  status: "hold" | "booked";
  company?: string;
};

type Store = {
  hall: string;
  updatedAt: string;
  stalls: Record<string, StallRecord>;
};

export type HoldRequest = {
  stalls: string[];
  company: string;
  contact: string;
  email: string;
  phone?: string;
  note?: string;
};

export { MAX_STALLS_PER_REQUEST };

const STORE_PATH = path.join(process.cwd(), "data", "stall-bookings.json");

const EMPTY: Store = {
  hall: "1C",
  updatedAt: new Date(0).toISOString(),
  stalls: {},
};

async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      hall: parsed.hall ?? EMPTY.hall,
      updatedAt: parsed.updatedAt ?? EMPTY.updatedAt,
      stalls: parsed.stalls ?? {},
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { ...EMPTY };
    throw error;
  }
}

async function writeStore(store: Store): Promise<void> {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

/**
 * Serialises writes so two concurrent requests cannot both read-then-clobber.
 * Only protects this process - see the module note about multi-instance hosts.
 */
let queue: Promise<unknown> = Promise.resolve();
function serialise<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

/** Public availability snapshot: ids and statuses only, no contact details. */
export async function getPublicStates(): Promise<{
  updatedAt: string;
  stalls: PublicStallState[];
}> {
  const store = await readStore();
  const stalls = Object.entries(store.stalls)
    .filter(([id]) => isStallId(id))
    .map(([id, record]) => ({
      id,
      status: record.status,
      ...(record.company ? { company: record.company } : {}),
    }));
  return { updatedAt: store.updatedAt, stalls };
}

export type HoldResult =
  | { ok: true; held: string[] }
  | { ok: false; reason: "conflict"; taken: PublicStallState[] }
  | { ok: false; reason: "invalid"; message: string };

/**
 * Places a hold on every requested stall, or nothing at all. Holds are
 * provisional: an organiser promotes them to `booked` by editing the store.
 */
export function requestHold(request: HoldRequest): Promise<HoldResult> {
  return serialise(async () => {
    const ids = [...new Set(request.stalls)];

    if (ids.length === 0) {
      return {
        ok: false,
        reason: "invalid",
        message: "Select at least one stall.",
      };
    }
    if (ids.length > MAX_STALLS_PER_REQUEST) {
      return {
        ok: false,
        reason: "invalid",
        message: `A single request can cover at most ${MAX_STALLS_PER_REQUEST} stalls.`,
      };
    }
    const unknown = ids.filter((id) => !isStallId(id));
    if (unknown.length) {
      return {
        ok: false,
        reason: "invalid",
        message: `Not stalls in Hall 1C: ${unknown.join(", ")}.`,
      };
    }

    const store = await readStore();
    const taken = ids
      .filter((id) => store.stalls[id])
      .map((id) => ({
        id,
        status: store.stalls[id].status,
        ...(store.stalls[id].company
          ? { company: store.stalls[id].company }
          : {}),
      }));
    if (taken.length) return { ok: false, reason: "conflict", taken };

    const requestedAt = new Date().toISOString();
    for (const id of ids) {
      store.stalls[id] = {
        status: "hold",
        company: request.company,
        contact: request.contact,
        email: request.email,
        ...(request.phone ? { phone: request.phone } : {}),
        ...(request.note ? { note: request.note } : {}),
        requestedAt,
      };
    }
    store.updatedAt = requestedAt;
    await writeStore(store);
    return { ok: true, held: ids };
  });
}
