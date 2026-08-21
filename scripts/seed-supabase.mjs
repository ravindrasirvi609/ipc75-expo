import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const envText = await readFile(new URL("../.env.local", import.meta.url), "utf8").catch(() => "");
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
}
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key)
  throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY first.");
const source = JSON.parse(
  await readFile(
    new URL("../data/stall-bookings.json", import.meta.url),
    "utf8",
  ),
);
const rows = Object.entries(source.stalls).map(([stall_id, value]) => ({
  stall_id,
  status: value.status,
  company: value.company ?? null,
  contact: value.contact ?? null,
  email: value.email ?? null,
  phone: value.phone ?? null,
  note: value.note ?? null,
  requested_at: value.requestedAt ?? null,
  updated_at: source.updatedAt,
}));
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { error } = await supabase
  .from("stall_bookings")
  .upsert(rows, { onConflict: "stall_id" });
if (error) throw error;
console.log(`Seeded ${rows.length} stall bookings.`);
