/**
 * Checks the site's facts against the official brochure, and checks that the
 * placeholder content it replaced has not crept back in.
 *
 *   npm run verify:content
 *
 * The second half matters more than it looks: the homepage used to advertise
 * "HITEX, HYDERABAD" and invented stand numbers because those strings were
 * scattered through JSX. Facts now live in lib/expo-content.ts, and this fails
 * the build if any of them are hardcoded somewhere else.
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  CONTACTS,
  EMAILS,
  EVENT,
  EXHIBITOR_PROFILE,
  ORGANISERS,
  SPACE_TYPES,
  STALL_MODULE,
  VENUE,
  VISITOR_PROFILE,
} from "../lib/expo-content.ts";
import { PUBLIC_FINANCE } from "../lib/finance.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const failures = [];
const checks = [];
const expect = (label, actual, wanted) => {
  if (actual === wanted) checks.push(`${label} = ${wanted}`);
  else failures.push(`${label}: expected ${JSON.stringify(wanted)}, got ${JSON.stringify(actual)}`);
};

/* -- 1. Brochure figures -------------------------------------------- */

expect("event name", EVENT.name, "Pharma PowderTech Expo 2026");
expect("congress", EVENT.parent, "75th Indian Pharmaceutical Congress");
expect("milestone", EVENT.milestone, "Platinum Jubilee");
expect("dates", EVENT.dates.label, "18 – 20 December 2026");
expect("day count", EVENT.dates.dayCount, 3);
expect("venue", VENUE.name, "Yashobhoomi Convention Centre");
expect("venue address", VENUE.address, "Sector 25, Dwarka, New Delhi – 110077");
expect("hall", VENUE.hall, "Hall 1C");
expect("host", ORGANISERS.hostShort, "IPGA");

expect("exhibitor categories", EXHIBITOR_PROFILE.length, 16);
expect("visitor categories", VISITOR_PROFILE.length, 17);
expect("sales contacts", CONTACTS.length, 4);
expect("desk emails", EMAILS.length, 2);

const shell = SPACE_TYPES.find((s) => s.id === "shell");
const bare = SPACE_TYPES.find((s) => s.id === "bare");
expect("shell rate", shell?.rate, 12000);
expect("bare rate", bare?.rate, 11000);
expect("stall area", STALL_MODULE.area, 9);
expect("stall size", STALL_MODULE.size, "3m × 3m");

expect("PAN", PUBLIC_FINANCE.pan, "AAATT7705P");
expect("GST", PUBLIC_FINANCE.gst, "07AAATT7705P2ZW");
expect("CSR", PUBLIC_FINANCE.csr, "CSR00110215");
expect("payee", PUBLIC_FINANCE.payee, "75th IPC a/c IPGA");

for (const contact of CONTACTS) {
  if (!/^\d{10}$/.test(contact.phone)) {
    failures.push(`contact ${contact.name}: phone "${contact.phone}" is not 10 digits`);
  }
}
for (const email of EMAILS) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    failures.push(`email "${email}" is malformed`);
  }
}
if (!failures.length) checks.push("contact numbers and emails well-formed");

/* -- 2. Stale content must not reappear ----------------------------- */

/** Strings from the placeholder site, and facts that belong only in the data. */
const BANNED = [
  { pattern: /HITEX/i, why: "wrong venue from the placeholder site" },
  { pattern: /Hyderabad/i, why: "wrong city from the placeholder site" },
  { pattern: /\b[AB]10[123]\b|\bB20[123]\b/, why: "invented stand ids from the placeholder site" },
  { pattern: /50100876687745/, why: "bank account number must never be in a page or component" },
  { pattern: /HDFC0004364/, why: "bank IFSC must never be in a page or component" },
];

/** Facts that must be read from lib/expo-content.ts, never retyped. */
const MUST_NOT_HARDCODE = [
  { pattern: /Yashobhoomi/, why: "use VENUE.name" },
  { pattern: /\b12000\b|\b11000\b/, why: "use SPACE_TYPES rates" },
  { pattern: /AAATT7705P/, why: "use PUBLIC_FINANCE.pan" },
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(tsx?|css|mjs)$/.test(entry.name)) yield full;
  }
}

const SOURCE_DIRS = ["app", "components"];
let scanned = 0;

for (const dir of SOURCE_DIRS) {
  for await (const file of walk(path.join(root, dir))) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const source = await readFile(file, "utf8");
    scanned++;

    for (const { pattern, why } of BANNED) {
      if (pattern.test(source)) failures.push(`${rel} contains ${pattern} — ${why}`);
    }
    for (const { pattern, why } of MUST_NOT_HARDCODE) {
      if (pattern.test(source)) failures.push(`${rel} hardcodes ${pattern} — ${why}`);
    }
  }
}
checks.push(`scanned ${scanned} files in ${SOURCE_DIRS.join(", ")}`);

/* -- Report ---------------------------------------------------------- */

for (const message of checks) console.log(`  ok   ${message}`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const message of failures) console.error(`  FAIL ${message}`);
  process.exit(1);
}
console.log(`\nSite content matches the brochure (${checks.length} checks passed).`);
