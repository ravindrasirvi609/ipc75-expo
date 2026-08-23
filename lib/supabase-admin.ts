import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Server-only client, built on first use rather than at import time.
 *
 * A missing credential used to throw while this module was being loaded —
 * before any caller's try/catch could run, since that happens during the
 * import graph, not inside a request. Building it lazily, inside a function
 * body, means the same failure now happens where callers can actually catch
 * it and degrade gracefully instead of crashing the whole page.
 *
 * Never import this module from a Client Component.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    throw new Error("Missing Supabase server environment variables.");
  client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}
