/**
 * Verifies lib/hall-1c-plan.ts against the source drawing it reproduces.
 *
 * It re-detects every cell in public/assets/ipc-hall-1c-plan.png from scratch
 * (flood fill over the black line work) and then checks that the hand-entered
 * layout data lines up with what the image actually contains. Run it after any
 * edit to the plan data:
 *
 *   npm run verify:plan
 *
 * Exits non-zero on the first category of failure so CI can gate on it.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import {
  STALLS,
  BLOCKED_CELLS,
  SECTIONS,
  HALL_RECT,
  ux,
  uy,
} from "../lib/hall-1c-plan.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "public/assets/ipc-hall-1c-plan.png");

/** Expected stall count per section, from the printed id ranges. */
const EXPECTED = { "1A": 22, "1B": 44, "1C": 58, "1D": 46, "1E": 10 };
/** Tolerance in drawing px when matching our rects to detected ones. */
const TOL = 3;

const failures = [];
const fail = (group, message) => failures.push(`${group}: ${message}`);
const checks = [];
const pass = (message) => checks.push(message);

/* -- 1. Structural checks on the data itself ------------------------- */

const total = Object.values(EXPECTED).reduce((a, b) => a + b, 0);
if (STALLS.length !== total) {
  fail("count", `expected ${total} stalls, got ${STALLS.length}`);
} else {
  pass(`${STALLS.length} stalls`);
}

if (BLOCKED_CELLS.length !== 2) {
  fail("blocked", `expected 2 blocked cells, got ${BLOCKED_CELLS.length}`);
} else {
  pass("2 blocked cells");
}

const seen = new Set();
for (const stall of STALLS) {
  if (seen.has(stall.id)) fail("duplicate", stall.id);
  seen.add(stall.id);
}

for (const section of SECTIONS) {
  const ids = STALLS.filter((s) => s.section === section)
    .map((s) => Number(s.id.slice(3)))
    .sort((a, b) => a - b);
  const expected = EXPECTED[section];
  if (ids.length !== expected) {
    fail(
      "section",
      `${section} has ${ids.length} stalls, expected ${expected}`,
    );
    continue;
  }
  const gaps = ids.filter((n, i) => n !== i + 1);
  if (gaps.length) {
    fail(
      "section",
      `${section} is not a clean 1..${expected} run (saw ${gaps.join(",")})`,
    );
  } else {
    pass(
      `${section} covers ${section}-01..${section}-${String(expected).padStart(2, "0")}`,
    );
  }
}

/* -- 2. No two cells may overlap, and all must sit inside the hall --- */

const cells = [
  ...STALLS.map((s) => ({ ...s, id: s.id })),
  ...BLOCKED_CELLS.map((c, i) => ({ ...c, id: `blocked-${i + 1}` })),
];

for (let i = 0; i < cells.length; i++) {
  for (let j = i + 1; j < cells.length; j++) {
    const a = cells[i];
    const b = cells[j];
    const overlapX = a.x < b.x + b.w - TOL && b.x < a.x + a.w - TOL;
    const overlapY = a.y < b.y + b.h - TOL && b.y < a.y + a.h - TOL;
    if (overlapX && overlapY) fail("overlap", `${a.id} overlaps ${b.id}`);
  }
}
if (!failures.some((f) => f.startsWith("overlap")))
  pass("no overlapping cells");

for (const cell of cells) {
  const inside =
    cell.x >= HALL_RECT.x - TOL &&
    cell.y >= HALL_RECT.y - TOL &&
    cell.x + cell.w <= HALL_RECT.x + HALL_RECT.w + TOL &&
    cell.y + cell.h <= HALL_RECT.y + HALL_RECT.h + TOL;
  if (!inside) fail("bounds", `${cell.id} falls outside the hall wall`);
}
if (!failures.some((f) => f.startsWith("bounds")))
  pass("all cells inside the hall wall");

/* -- 3. Grid alignment: every cell lands on whole-metre coordinates -- */

for (const cell of cells) {
  if (!Number.isInteger(cell.u) || !Number.isInteger(cell.v)) {
    fail("grid", `${cell.id} is not on a whole-metre grid position`);
  }
  if (
    Math.abs(cell.x - ux(cell.u)) > 0.01 ||
    Math.abs(cell.y - uy(cell.v)) > 0.01
  ) {
    fail("grid", `${cell.id} rect does not match its grid position`);
  }
}
if (!failures.some((f) => f.startsWith("grid")))
  pass("every cell on the 1 m grid");

/* -- 4. Match against cells detected in the source image ------------- */

const { data, info } = await sharp(SOURCE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const wall = new Uint8Array(W * H);
const red = new Uint8Array(W * H);
for (let i = 0, p = 0; i < W * H; i++, p += C) {
  const r = data[p];
  const g = data[p + 1];
  const b = data[p + 2];
  if (r < 120 && g < 120 && b < 120) wall[i] = 1;
  if (r > 140 && g < 110 && b < 110) red[i] = 1;
}

// Flood fill the white/red regions enclosed by the black line work. Each stall
// cell interior becomes one component roughly 76 x 57 px.
const label = new Int32Array(W * H).fill(-1);
const stack = new Int32Array(W * H);
const detected = [];
for (let i = 0; i < W * H; i++) {
  if (wall[i] || label[i] >= 0) continue;
  const id = detected.length;
  let sp = 0;
  stack[sp++] = i;
  label[i] = id;
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -1,
    y1 = -1,
    area = 0,
    redPixels = 0;
  while (sp > 0) {
    const k = stack[--sp];
    const x = k % W;
    const y = (k - x) / W;
    area++;
    if (red[k]) redPixels++;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    if (x > 0 && !wall[k - 1] && label[k - 1] < 0) {
      label[k - 1] = id;
      stack[sp++] = k - 1;
    }
    if (x < W - 1 && !wall[k + 1] && label[k + 1] < 0) {
      label[k + 1] = id;
      stack[sp++] = k + 1;
    }
    if (y > 0 && !wall[k - W] && label[k - W] < 0) {
      label[k - W] = id;
      stack[sp++] = k - W;
    }
    if (y < H - 1 && !wall[k + W] && label[k + W] < 0) {
      label[k + W] = id;
      stack[sp++] = k + W;
    }
  }
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  if (w >= 60 && w <= 95 && h >= 45 && h <= 72) {
    detected.push({ x0, y0, x1, y1, w, h, area, redPixels });
  }
}

/**
 * The drawing's cell borders are ~2 px strokes, so a detected interior sits
 * about 2 px inside the rect we draw. Match on centres instead of edges.
 */
const centreOf = (d) => ({
  cx: (d.x0 + d.x1 + 1) / 2,
  cy: (d.y0 + d.y1 + 1) / 2,
});
const unmatchedDetections = new Set(detected.keys());
let matched = 0;

/**
 * The red circulation line clips the corner of 1A-21, breaking its black border
 * so the flood fill leaks into the surrounding whitespace. That is the only cell
 * the detector is allowed to miss, and the reason is visual, not a data error.
 */
const KNOWN_UNDETECTABLE = new Set(["1A-21"]);

for (const cell of cells) {
  const cx = cell.x + cell.w / 2;
  const cy = cell.y + cell.h / 2;
  let bestIndex = -1;
  let bestDistance = Infinity;
  detected.forEach((d, index) => {
    const c = centreOf(d);
    const distance = Math.hypot(c.cx - cx, c.cy - cy);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  if (bestDistance > TOL) {
    if (!KNOWN_UNDETECTABLE.has(cell.id)) {
      fail(
        "image",
        `${cell.id} has no cell in the drawing within ${TOL}px (nearest ${bestDistance.toFixed(1)}px)`,
      );
    }
    continue;
  }
  matched++;
  unmatchedDetections.delete(bestIndex);

  const isBlocked = cell.id.startsWith("blocked-");
  const filledRed =
    detected[bestIndex].redPixels > detected[bestIndex].area * 0.5;
  if (isBlocked && !filledRed) {
    fail(
      "image",
      `${cell.id} is marked blocked but is not filled red in the drawing`,
    );
  }
  if (!isBlocked && filledRed) {
    fail("image", `${cell.id} is bookable but is filled red in the drawing`);
  }
}
if (matched === cells.length - KNOWN_UNDETECTABLE.size) {
  pass(`all ${matched} detectable cells matched a cell in the drawing`);
}

const leftover = [...unmatchedDetections].map((i) => detected[i]);
if (leftover.length) {
  fail(
    "image",
    `${leftover.length} cell(s) in the drawing are missing from the layout data: ` +
      leftover.map((d) => `(${d.x0},${d.y0})`).join(" "),
  );
}
const missedByDetector = cells.length - detected.length;
if (missedByDetector !== KNOWN_UNDETECTABLE.size) {
  fail(
    "image",
    `detector found ${detected.length} cells for ${cells.length} in the data; ` +
      `expected exactly ${KNOWN_UNDETECTABLE.size} known gap (${[...KNOWN_UNDETECTABLE].join(", ")})`,
  );
} else {
  pass(
    `detector gap is only the known ${[...KNOWN_UNDETECTABLE].join(", ")} border break`,
  );
}

/* -- 5. Seed data must reference real stalls ------------------------- */

try {
  const seed = JSON.parse(
    readFileSync(path.join(root, "data/stall-bookings.json"), "utf8"),
  );
  const ids = new Set(STALLS.map((s) => s.id));
  const bogus = Object.keys(seed.stalls ?? {}).filter((id) => !ids.has(id));
  if (bogus.length)
    fail(
      "seed",
      `unknown stall ids in data/stall-bookings.json: ${bogus.join(", ")}`,
    );
  else
    pass(
      `seed data references ${Object.keys(seed.stalls ?? {}).length} valid stalls`,
    );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

/* -- Report ---------------------------------------------------------- */

for (const message of checks) console.log(`  ok   ${message}`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const message of failures) console.error(`  FAIL ${message}`);
  process.exit(1);
}
console.log(
  `\nhall-1c-plan.ts matches the source drawing (${checks.length} checks passed).`,
);
