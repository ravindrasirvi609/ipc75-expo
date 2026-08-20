/**
 * Vector reconstruction of `public/assets/ipc-hall-1c-plan.png`
 * (75th IPC / IICC - Hall 1C exhibition layout).
 *
 * All coordinates live in the source drawing's own pixel space so the SVG is a
 * 1:1 reproduction of the printed plan. The drawing is anisotropic: the hall is
 * a 63 m x 100 m grid rendered 25.9921 px per metre horizontally and 19.805 px
 * per metre vertically, which is why `ux()` and `uy()` use different scales.
 *
 * Every number here was measured off the source PNG, not estimated.
 * `npm run verify:plan` re-checks this file against that image.
 */

/** Hall grid extent in metres. */
export const HALL_UNITS = { w: 63, h: 100 } as const;

/** Inner face of the hall wall, in drawing pixels. */
export const HALL_ORIGIN = { x: 313.5, y: 249.5 } as const;

/** Pixels per metre - deliberately different per axis (see file header). */
export const PX_PER_UNIT = { x: 25.9921, y: 19.805 } as const;

/** Metres -> drawing px, horizontal. */
export const ux = (u: number) => HALL_ORIGIN.x + PX_PER_UNIT.x * u;
/** Metres -> drawing px, vertical. */
export const uy = (v: number) => HALL_ORIGIN.y + PX_PER_UNIT.y * v;

/** Every stall in the hall is 3 m x 3 m / 9 sqm. */
export const STALL_UNITS = 3;
export const STALL_SIZE = {
  w: PX_PER_UNIT.x * STALL_UNITS,
  h: PX_PER_UNIT.y * STALL_UNITS,
} as const;

export const HALL_RECT = {
  x: HALL_ORIGIN.x,
  y: HALL_ORIGIN.y,
  w: PX_PER_UNIT.x * HALL_UNITS.w,
  h: PX_PER_UNIT.y * HALL_UNITS.h,
} as const;

/** Viewport of the whole drawing, including the red frame and the entry apron. */
export const VIEW_BOX = { x: 279, y: 224, width: 1706, height: 2152 } as const;

export type StallSection = "1A" | "1B" | "1C" | "1D" | "1E";

export type Stall = {
  /** Canonical id, e.g. `1C-12`. */
  id: string;
  /** Label as printed on the plan - differs from `id` for two draughting typos. */
  label: string;
  section: StallSection;
  /** Grid position in metres from the hall's top-left inner corner. */
  u: number;
  v: number;
  /** Rect in drawing px. */
  x: number;
  y: number;
  w: number;
  h: number;
  size: string;
  area: number;
};

/** A cell drawn solid red on the plan: structural, never bookable. */
export type BlockedCell = {
  u: number;
  v: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * One entry per drawn cell, grouped by grid row (`v`, metres from the top wall).
 * `null` marks the two unlabelled solid-red cells at the centre of the 1C-33
 * and 1C-13 blocks. Read directly off the artwork at 3x magnification.
 */
const PLAN_ROWS: Array<
  [v: number, cells: Array<[u: number, id: string | null]>]
> = [
  [
    2,
    [
      [28, "1E-10"],
      [31, "1E-09"],
      [35, "1E-08"],
      [38, "1E-07"],
      [41, "1E-06"],
      [44, "1E-05"],
      [50, "1E-04"],
      [53, "1E-03"],
      [56, "1E-02"],
      [59, "1E-01"],
    ],
  ],
  [
    8,
    [
      [28, "1D-24"],
      [31, "1D-23"],
      [38, "1C-58"],
      [41, "1C-57"],
      [44, "1C-56"],
      [50, "1B-23"],
      [53, "1B-22"],
      [59, "1A-22"],
    ],
  ],
  [
    11,
    [
      [28, "1D-25"],
      [31, "1D-22"],
      [38, "1C-53"],
      [41, "1C-54"],
      [44, "1C-55"],
      [50, "1B-24"],
      [53, "1B-21"],
      [59, "1A-21"],
    ],
  ],
  [
    17,
    [
      [28, "1D-26"],
      [31, "1D-21"],
      [38, "1C-52"],
      [41, "1C-51"],
      [44, "1C-50"],
      [50, "1B-25"],
      [53, "1B-20"],
      [59, "1A-20"],
    ],
  ],
  [
    20,
    [
      [28, "1D-27"],
      [31, "1D-20"],
      [38, "1C-47"],
      [41, "1C-48"],
      [44, "1C-49"],
      [50, "1B-26"],
      [53, "1B-19"],
      [59, "1A-19"],
    ],
  ],
  [
    23,
    [
      [28, "1D-28"],
      [31, "1D-19"],
      [50, "1B-27"],
      [53, "1B-18"],
      [59, "1A-18"],
    ],
  ],
  [
    26,
    [
      [28, "1D-29"],
      [31, "1D-18"],
      [38, "1C-46"],
      [41, "1C-45"],
      [44, "1C-44"],
      [50, "1B-28"],
      [53, "1B-17"],
      [59, "1A-17"],
    ],
  ],
  [
    29,
    [
      [28, "1D-30"],
      [31, "1D-17"],
      [38, "1C-41"],
      [41, "1C-42"],
      [44, "1C-43"],
      [50, "1B-29"],
      [53, "1B-16"],
      [59, "1A-16"],
    ],
  ],
  [
    35,
    [
      [28, "1D-31"],
      [31, "1D-16"],
      [38, "1C-40"],
      [41, "1C-39"],
      [44, "1C-38"],
      [50, "1B-30"],
      [53, "1B-15"],
      [59, "1A-15"],
    ],
  ],
  [
    38,
    [
      [28, "1D-32"],
      [31, "1D-15"],
      [38, "1C-33"],
      [41, null],
      [44, "1C-37"],
      [50, "1B-31"],
      [53, "1B-14"],
      [59, "1A-14"],
    ],
  ],
  [
    41,
    [
      [28, "1D-33"],
      [31, "1D-14"],
      [38, "1C-34"],
      [41, "1C-35"],
      [44, "1C-36"],
      [50, "1B-32"],
      [53, "1B-13"],
      [59, "1A-13"],
    ],
  ],
  [
    48,
    [
      [28, "1D-34"],
      [31, "1D-13"],
      [38, "1C-32"],
      [41, "1C-31"],
      [44, "1C-30"],
      [50, "1B-33"],
      [53, "1B-12"],
      [59, "1A-12"],
    ],
  ],
  [
    51,
    [
      [28, "1D-35"],
      [31, "1D-12"],
      [38, "1C-27"],
      [41, "1C-28"],
      [44, "1C-29"],
      [50, "1B-34"],
      [53, "1B-11"],
      [59, "1A-11"],
    ],
  ],
  [
    54,
    [
      [28, "1D-36"],
      [31, "1D-11"],
      [50, "1B-35"],
      [53, "1B-10"],
      [59, "1A-10"],
    ],
  ],
  [
    57,
    [
      [28, "1D-37"],
      [31, "1D-10"],
      [38, "1C-26"],
      [41, "1C-25"],
      [44, "1C-24"],
      [50, "1B-36"],
      [53, "1B-09"],
      [59, "1A-09"],
    ],
  ],
  [
    60,
    [
      [28, "1D-38"],
      [31, "1D-09"],
      [38, "1C-21"],
      [41, "1C-22"],
      [44, "1C-23"],
      [50, "1B-37"],
      [53, "1B-08"],
      [59, "1A-08"],
    ],
  ],
  [
    67,
    [
      [28, "1D-39"],
      [31, "1D-08"],
      [38, "1C-20"],
      [41, "1C-19"],
      [44, "1C-18"],
      [50, "1B-38"],
      [53, "1B-07"],
    ],
  ],
  [68, [[59, "1A-07"]]],
  [
    70,
    [
      [28, "1D-40"],
      [31, "1D-07"],
      [38, "1C-13"],
      [41, null],
      [44, "1C-17"],
      [50, "1B-39"],
      [53, "1B-06"],
    ],
  ],
  [71, [[59, "1A-06"]]],
  [
    73,
    [
      [28, "1D-41"],
      [31, "1D-06"],
      [38, "1C-14"],
      [41, "1C-15"],
      [44, "1C-16"],
      [50, "1B-40"],
      [53, "1B-05"],
    ],
  ],
  [74, [[59, "1A-05"]]],
  [77, [[59, "1A-04"]]],
  [
    80,
    [
      [28, "1D-42"],
      [31, "1D-05"],
      [38, "1C-12"],
      [41, "1C-11"],
      [44, "1C-10"],
      [50, "1B-41"],
      [53, "1B-04"],
      [59, "1A-03"],
    ],
  ],
  [
    83,
    [
      [28, "1D-43"],
      [31, "1D-04"],
      [38, "1C-07"],
      [41, "1C-08"],
      [44, "1C-09"],
      [50, "1B-42"],
      [53, "1B-03"],
      [59, "1A-02"],
    ],
  ],
  [
    86,
    [
      [28, "1D-44"],
      [31, "1D-03"],
      [59, "1A-01"],
    ],
  ],
  [
    89,
    [
      [28, "1D-45"],
      [31, "1D-02"],
      [38, "1C-06"],
      [41, "1C-05"],
      [44, "1C-04"],
      [50, "1B-43"],
      [53, "1B-02"],
    ],
  ],
  [
    92,
    [
      [28, "1D-46"],
      [31, "1D-01"],
      [38, "1C-01"],
      [41, "1C-02"],
      [44, "1C-03"],
      [50, "1B-44"],
      [53, "1B-01"],
    ],
  ],
];

/**
 * Labels that are mis-typed on the printed plan. We book against the canonical
 * id but draw exactly what the plan says, so the screen matches the paper.
 */
const PRINTED_LABELS: Record<string, string> = {
  "1A-19": "1A-019",
  "1C-39": "39",
};

function buildPlan() {
  const stalls: Stall[] = [];
  const blocked: BlockedCell[] = [];

  for (const [v, cells] of PLAN_ROWS) {
    for (const [u, id] of cells) {
      const rect = { x: ux(u), y: uy(v), w: STALL_SIZE.w, h: STALL_SIZE.h };
      if (id === null) {
        blocked.push({ u, v, ...rect });
        continue;
      }
      stalls.push({
        id,
        label: PRINTED_LABELS[id] ?? id,
        section: id.slice(0, 2) as StallSection,
        u,
        v,
        ...rect,
        size: "3m x 3m",
        area: 9,
      });
    }
  }
  return { stalls, blocked };
}

const plan = buildPlan();

export const STALLS: readonly Stall[] = plan.stalls;
export const BLOCKED_CELLS: readonly BlockedCell[] = plan.blocked;
export const STALL_IDS: readonly string[] = plan.stalls.map((s) => s.id);

const STALL_BY_ID = new Map(plan.stalls.map((s) => [s.id, s]));

export const getStall = (id: string) => STALL_BY_ID.get(id);
export const isStallId = (id: string) => STALL_BY_ID.has(id);

export const SECTIONS: readonly StallSection[] = ["1A", "1B", "1C", "1D", "1E"];

/* ------------------------------------------------------------------ *
 * Static architecture, measured from the source PNG.
 * ------------------------------------------------------------------ */

/** Red perimeter frame: three bands around the hall wall. */
export const RED_FRAME = [
  { x: 285, y: 230, w: 1694, h: 19.5 },
  { x: 285, y: 230, w: 28.5, h: 2020.5 },
  { x: 1951, y: 230, w: 28, h: 2000 },
] as const;

/** Red apron below the hall, drawn as one stepped polygon. */
export const RED_APRON = "M285 2230 H1770 V2370 H912 V2251 H285 Z";

/** Yellow entry gate block, bottom-right. */
export const YELLOW_GATE = { x: 1770, y: 2230, w: 209, h: 140 } as const;

/** Delegate luncheon zone enclosure. */
export const LUNCHEON_RECT = { x: 339.5, y: 289, w: 598.5, h: 1842 } as const;

/**
 * The two red circulation spines and the central service aisle. Stroke widths
 * match the source: the splayed spines are drawn 3 px, the central aisle 2 px.
 */
export const AISLE_PATHS = [
  { d: "M313.5 411 L605 576 H1851 L1951 488", width: 3 },
  { d: "M313.5 1617 L605 1516 H1850 L1948 1577", width: 3 },
  { d: "M1229.5 575 V2230", width: 2 },
] as const;

export type PlanText = {
  text: string;
  x: number;
  y: number;
  size: number;
  /** Force the exact printed width regardless of the rendering font. */
  length?: number;
  anchor?: "start" | "middle";
  rotate?: boolean;
};

export const ZONE_LABELS: readonly PlanText[] = [
  {
    text: "DELEGATE LUNCHEON",
    x: 601.5,
    y: 1418,
    size: 42,
    length: 410,
    anchor: "middle",
  },
  { text: "ZONE", x: 604.5, y: 1473, size: 42, length: 100, anchor: "middle" },
];

export const ENTRY_LABELS: readonly PlanText[] = [
  { text: "ENTRY / EXIT", x: 971, y: 869, size: 28, length: 151, rotate: true },
  {
    text: "ENTRY / EXIT",
    x: 979,
    y: 1502,
    size: 28,
    length: 151,
    rotate: true,
  },
  { text: "ENTRY / EXIT", x: 528, y: 2176, size: 28, length: 151 },
  { text: "ENTRY / EXIT", x: 1769, y: 2297, size: 28, length: 151 },
];

/** Red directional arrows at each opening. */
export const ARROWS: readonly string[] = [
  // west aisle mouth, upper - a right/left pair
  "M960 913.5 L947 900.5 V906.5 H907 V920.5 H947 V926.5 Z",
  "M904 938 L917 925 V931 H955 V945 H917 V951 Z",
  // west aisle mouth, lower - same pair, offset
  "M968 1546 L955 1533 V1539 H915 V1553 H955 V1559 Z",
  "M912 1571 L925 1558 V1564 H963 V1578 H925 V1584 Z",
  // luncheon zone south door
  "M603 2107.5 L619.5 2124.5 H610.5 V2150.5 H595.5 V2124.5 H586.5 Z",
  "M637.5 2106.5 H653.5 V2133.5 H660.5 L645.5 2149.5 L630 2133.5 H637.5 Z",
  // main south-east gate
  "M1822 2200 L1843.5 2222.5 H1832.5 V2269.5 H1811.5 V2222.5 H1800.5 Z",
  "M1883.5 2199.5 H1904.5 V2246.5 H1915.5 L1894.5 2268 L1874 2246.5 H1883.5 Z",
];

/** Ruler tick labels printed on the red frame (metres). */
export const RULER = {
  fontSize: 12.6,
  top: Array.from({ length: HALL_UNITS.w }, (_, i) => ({
    label: String(i + 1),
    x: 313.995 + 25.9802 * (i + 0.5),
    y: 245,
  })),
  left: Array.from({ length: HALL_UNITS.h }, (_, i) => ({
    label: String(i + 1),
    x: 301,
    y: 247.2 + 19.778 * (i + 1),
  })),
} as const;

/**
 * Text placement inside a stall cell, relative to its top-left corner.
 * Offsets are baselines, tuned until a rasterised render sat on top of the
 * source drawing's own lettering (see scripts/verify-render.mjs).
 */
export const CELL_TEXT = {
  fontSize: 12.6,
  idOffset: { x: 4, y: 16.5 },
  sizeOffset: { x: 74, y: 38.5 },
  areaOffset: { x: 74, y: 56.5 },
} as const;
