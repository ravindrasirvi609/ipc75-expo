/**
 * Renders the vector plan from lib/hall-1c-plan.ts and compares it, pixel by
 * pixel, with the source drawing it reproduces.
 *
 *   npm run verify:render
 *
 * Text is deliberately not compared - glyph rasterisation differs between the
 * original PDF export and librsvg, and that says nothing about whether the plan
 * is correct. What is compared is font-independent and structural:
 *
 *   1. red mask overlap  - frame, aisles, arrows, blocked cells
 *   2. cell detection    - every cell found in our render must sit within 2 px
 *                          of the matching cell in the original
 *   3. ink overlap        - advisory only, reported not asserted
 *
 * Writes tmp/render-check/ so a mismatch can be eyeballed.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import {
  AISLE_PATHS,
  ARROWS,
  BLOCKED_CELLS,
  CELL_TEXT,
  ENTRY_LABELS,
  HALL_RECT,
  LUNCHEON_RECT,
  RED_APRON,
  RED_FRAME,
  RULER,
  STALLS,
  YELLOW_GATE,
  ZONE_LABELS,
} from "../lib/hall-1c-plan.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "public/assets/ipc-hall-1c-plan.png");
const OUT_DIR = path.join(root, "tmp/render-check");

const RED = "#ed1c24";
const FONT = 'Arial, Helvetica, "Liberation Sans", sans-serif';

const text = ({ text, x, y, size, length, anchor, rotate }) => {
  const attrs = [
    `font-size="${size}"`,
    'font-weight="700"',
    `text-anchor="${anchor ?? "start"}"`,
    length ? `textLength="${length}" lengthAdjust="spacingAndGlyphs"` : "",
    rotate
      ? `transform="translate(${x} ${y}) rotate(90)" x="0" y="0"`
      : `x="${x}" y="${y}"`,
  ]
    .filter(Boolean)
    .join(" ");
  return `<text ${attrs}>${text}</text>`;
};

/**
 * Mirrors components/floor-plan/HallPlanSvg.tsx in its default (all available)
 * state. Both read the same constants, so this checks the geometry, not the JSX.
 */
function buildSvg() {
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="2163" height="2800" viewBox="0 0 2163 2800">`,
    `<rect width="2163" height="2800" fill="#fff"/>`,
    `<g font-family='${FONT}' fill="#000">`,
    ...RED_FRAME.map(
      (b) =>
        `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${RED}"/>`,
    ),
    `<path d="${RED_APRON}" fill="${RED}"/>`,
    `<rect x="${YELLOW_GATE.x}" y="${YELLOW_GATE.y}" width="${YELLOW_GATE.w}" height="${YELLOW_GATE.h}" fill="#fff200"/>`,
    `<rect x="${HALL_RECT.x}" y="${HALL_RECT.y}" width="${HALL_RECT.w}" height="${HALL_RECT.h}" fill="#fff" stroke="#000" stroke-width="2"/>`,
    `<rect x="${LUNCHEON_RECT.x}" y="${LUNCHEON_RECT.y}" width="${LUNCHEON_RECT.w}" height="${LUNCHEON_RECT.h}" fill="#fff" stroke="#000" stroke-width="2"/>`,
    ...ZONE_LABELS.map(text),
    ...AISLE_PATHS.map(
      (a) =>
        `<path d="${a.d}" fill="none" stroke="${RED}" stroke-width="${a.width}"/>`,
    ),
    ...ARROWS.map((d) => `<path d="${d}" fill="${RED}"/>`),
    ...ENTRY_LABELS.map(text),
    `<g font-size="${RULER.fontSize}" text-anchor="middle">`,
    ...RULER.top.map((t) => `<text x="${t.x}" y="${t.y}">${t.label}</text>`),
    ...RULER.left.map((t) => `<text x="${t.x}" y="${t.y}">${t.label}</text>`),
    `</g>`,
    ...BLOCKED_CELLS.map(
      (c) =>
        `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="${RED}" stroke="#000" stroke-width="2"/>`,
    ),
  ];

  for (const s of STALLS) {
    parts.push(
      `<g>`,
      `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="#fff" stroke="#000" stroke-width="2"/>`,
      `<text x="${s.x + CELL_TEXT.idOffset.x}" y="${s.y + CELL_TEXT.idOffset.y}" font-size="${CELL_TEXT.fontSize}">${s.label}</text>`,
      `<text x="${s.x + CELL_TEXT.sizeOffset.x}" y="${s.y + CELL_TEXT.sizeOffset.y}" font-size="${CELL_TEXT.fontSize}" text-anchor="end">${s.size}</text>`,
      `<text x="${s.x + CELL_TEXT.areaOffset.x}" y="${s.y + CELL_TEXT.areaOffset.y}" font-size="${CELL_TEXT.fontSize}" text-anchor="end">${s.area}sqm</text>`,
      `</g>`,
    );
  }

  parts.push(`</g></svg>`);
  return parts.join("\n");
}

/** Dark / red boolean masks plus flood-filled cell rectangles. */
function analyse(data, W, H, C) {
  const dark = new Uint8Array(W * H);
  const red = new Uint8Array(W * H);
  for (let i = 0, p = 0; i < W * H; i++, p += C) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    if (r < 120 && g < 120 && b < 120) dark[i] = 1;
    else if (r > 140 && g < 110 && b < 110) red[i] = 1;
  }

  const label = new Int32Array(W * H).fill(-1);
  const stack = new Int32Array(W * H);
  const cells = [];
  for (let i = 0; i < W * H; i++) {
    if (dark[i] || label[i] >= 0) continue;
    const id = cells.length;
    let sp = 0;
    stack[sp++] = i;
    label[i] = id;
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -1,
      y1 = -1;
    while (sp > 0) {
      const k = stack[--sp];
      const x = k % W;
      const y = (k - x) / W;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      if (x > 0 && !dark[k - 1] && label[k - 1] < 0) {
        label[k - 1] = id;
        stack[sp++] = k - 1;
      }
      if (x < W - 1 && !dark[k + 1] && label[k + 1] < 0) {
        label[k + 1] = id;
        stack[sp++] = k + 1;
      }
      if (y > 0 && !dark[k - W] && label[k - W] < 0) {
        label[k - W] = id;
        stack[sp++] = k - W;
      }
      if (y < H - 1 && !dark[k + W] && label[k + W] < 0) {
        label[k + W] = id;
        stack[sp++] = k + W;
      }
    }
    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;
    if (w >= 60 && w <= 95 && h >= 45 && h <= 72) {
      cells.push({ cx: (x0 + x1 + 1) / 2, cy: (y0 + y1 + 1) / 2 });
    }
  }
  return { dark, red, cells };
}

/**
 * Line art never matches an antialiased raster pixel-for-pixel, so coverage is
 * measured with a 1 px tolerance: a pixel counts as matched when the other mask
 * has ink anywhere in its 3x3 neighbourhood. Returns both directions.
 */
const coverage = (a, b, W, H) => {
  const near = (mask, x, y) => {
    for (let dy = -1; dy <= 1; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= H) continue;
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= W) continue;
        if (mask[yy * W + xx]) return true;
      }
    }
    return false;
  };
  let aTotal = 0,
    aHit = 0,
    bTotal = 0,
    bHit = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (a[i]) {
        aTotal++;
        if (near(b, x, y)) aHit++;
      }
      if (b[i]) {
        bTotal++;
        if (near(a, x, y)) bHit++;
      }
    }
  }
  return {
    ours: aTotal ? aHit / aTotal : 1,
    source: bTotal ? bHit / bTotal : 1,
  };
};

const svg = buildSvg();
await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "plan.svg"), svg, "utf8");

const rendered = await sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(path.join(OUT_DIR, "rendered.png"), rendered);

const [mine, theirs] = await Promise.all(
  [rendered, SOURCE].map((input) =>
    sharp(input)
      .ensureAlpha()
      .flatten({ background: "#ffffff" })
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ),
);

if (
  mine.info.width !== theirs.info.width ||
  mine.info.height !== theirs.info.height
) {
  console.error(
    `size mismatch: rendered ${mine.info.width}x${mine.info.height}, source ${theirs.info.width}x${theirs.info.height}`,
  );
  process.exit(1);
}

const W = mine.info.width;
const H = mine.info.height;
const a = analyse(mine.data, W, H, mine.info.channels);
const b = analyse(theirs.data, W, H, theirs.info.channels);

// Visual diff: red where only ours has ink, blue where only the source does.
const diff = Buffer.alloc(W * H * 3, 255);
for (let i = 0; i < W * H; i++) {
  const ours = a.dark[i] || a.red[i];
  const source = b.dark[i] || b.red[i];
  if (ours && !source) {
    diff[i * 3] = 230;
    diff[i * 3 + 1] = 40;
    diff[i * 3 + 2] = 40;
  } else if (!ours && source) {
    diff[i * 3] = 30;
    diff[i * 3 + 1] = 90;
    diff[i * 3 + 2] = 220;
  } else if (ours) {
    diff[i * 3] = 190;
    diff[i * 3 + 1] = 190;
    diff[i * 3 + 2] = 190;
  }
}
await sharp(diff, { raw: { width: W, height: H, channels: 3 } })
  .png()
  .toFile(path.join(OUT_DIR, "diff.png"));

const redCover = coverage(a.red, b.red, W, H);
const inkCover = coverage(a.dark, b.dark, W, H);

let worst = 0;
let unmatched = 0;
for (const cell of a.cells) {
  let best = Infinity;
  for (const other of b.cells) {
    const d = Math.hypot(cell.cx - other.cx, cell.cy - other.cy);
    if (d < best) best = d;
  }
  if (best > 2) unmatched++;
  if (best > worst && best < 50) worst = best;
}

console.log(
  `rendered cells      ${a.cells.length}  (source ${b.cells.length})`,
);
console.log(`cell centre offset  worst ${worst.toFixed(2)} px`);
console.log(
  `red mask coverage   ours->source ${(redCover.ours * 100).toFixed(2)}%  source->ours ${(redCover.source * 100).toFixed(2)}%`,
);
console.log(
  `ink coverage        ours->source ${(inkCover.ours * 100).toFixed(2)}%  source->ours ${(inkCover.source * 100).toFixed(2)}%  (advisory: glyph rasterisation differs)`,
);
console.log(`artefacts written   ${path.relative(root, OUT_DIR)}`);

/*
 * The red aisle line clips a corner of 1A-21 in the source, breaking its border
 * so the detector cannot see it there. Our render draws the cell whole, so we
 * legitimately detect exactly one cell more than the source does.
 */
const KNOWN_EXTRA = 1;

const problems = [];
if (unmatched > KNOWN_EXTRA) {
  problems.push(`${unmatched} rendered cell(s) more than 2 px from the source`);
}
if (a.cells.length - b.cells.length !== KNOWN_EXTRA) {
  problems.push(
    `rendered ${a.cells.length} cells vs ${b.cells.length} in the source; expected exactly ${KNOWN_EXTRA} more`,
  );
}
if (redCover.ours < 0.97)
  problems.push(
    `only ${(redCover.ours * 100).toFixed(2)}% of our red ink lands on the source`,
  );
if (redCover.source < 0.97)
  problems.push(
    `only ${(redCover.source * 100).toFixed(2)}% of the source red ink is covered`,
  );

if (problems.length) {
  console.error("\nrender does not match the source drawing:");
  for (const p of problems) console.error(`  FAIL ${p}`);
  process.exit(1);
}
console.log("\nvector render matches the source drawing.");
