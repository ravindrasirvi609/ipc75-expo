/**
 * Resolves optional background media from `public/assets/media/`.
 *
 * Server-side only — it touches the filesystem. Every slot is optional by
 * design: if a file is not there, `resolveBackdrop` returns nothing and the
 * section renders exactly as it does with no media at all. That means the site
 * ships and looks finished before a single photo exists, and gains the photo the
 * moment one is dropped in.
 *
 * See public/assets/media/README.md for the file list and size budgets.
 */
import { existsSync } from "node:fs";
import path from "node:path";

const MEDIA_DIR = path.join(process.cwd(), "public", "assets", "media");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const PUBLIC_PREFIX = "/assets/media";

export type BackdropSlot =
  | "hero"
  | "exhibitors"
  | "visitors"
  | "charges"
  | "venue";

type SlotSpec = {
  /** Base filename without extension. */
  base: string;
  /** Whether this slot may carry a looping video as well as a still. */
  video: boolean;
  /** What the picture should show, for whoever supplies it. */
  brief: string;
  /** Intended pixel dimensions of the still. */
  size: string;
};

export const MEDIA_MANIFEST: Record<BackdropSlot, SlotSpec> = {
  hero: {
    base: "hero-floor",
    video: true,
    brief:
      "Exhibition floor or plant-room footage, slow movement, no on-screen text. 8–12s seamless loop.",
    size: "1920×1080",
  },
  exhibitors: {
    base: "exhibitors-plant",
    video: false,
    brief: "Powder processing or granulation equipment on a plant floor.",
    size: "1600×1000",
  },
  visitors: {
    base: "visitors-hall",
    video: false,
    brief: "Delegates walking a trade-show aisle, faces not identifiable.",
    size: "1600×1000",
  },
  charges: {
    base: "charges-stand",
    video: false,
    brief: "A built exhibition stall, three-quarter view.",
    size: "1600×1000",
  },
  venue: {
    base: "venue-yashobhoomi",
    video: false,
    brief: "Yashobhoomi exterior or main concourse, daylight.",
    size: "2000×1200",
  },
};

const STILL_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const VIDEO_EXTENSIONS = ["mp4", "webm"];

const findFile = (base: string, extensions: string[]) => {
  for (const extension of extensions) {
    const file = `${base}.${extension}`;
    if (existsSync(path.join(MEDIA_DIR, file))) return `${PUBLIC_PREFIX}/${file}`;
  }
  return undefined;
};

export type Backdrop = {
  /** Still image, used on its own or as the video's poster. */
  image?: string;
  /** Looping video sources, in the order the browser should try them. */
  videos: string[];
};

/**
 * What exists on disk for one slot. Returns `null` when the slot is empty so
 * callers can skip rendering a backdrop entirely.
 */
export function resolveBackdrop(slot: BackdropSlot): Backdrop | null {
  const spec = MEDIA_MANIFEST[slot];
  const image = findFile(spec.base, STILL_EXTENSIONS);
  const videos = spec.video
    ? VIDEO_EXTENSIONS.map((extension) => findFile(spec.base, [extension])).filter(
        (value): value is string => Boolean(value),
      )
    : [];

  // The supplied hero clip lives at the public root rather than in the
  // optional media directory used by the other backdrop slots.
  if (slot === "hero" && existsSync(path.join(PUBLIC_DIR, "expo-clip.mp4"))) {
    videos.push("/expo-clip.mp4");
  }

  if (!image && !videos.length) return null;
  return { image, videos };
}

/** Slot-by-slot report, for `npm run verify:content`. */
export function mediaReport() {
  return (Object.keys(MEDIA_MANIFEST) as BackdropSlot[]).map((slot) => {
    const found = resolveBackdrop(slot);
    return {
      slot,
      spec: MEDIA_MANIFEST[slot],
      image: found?.image,
      videos: found?.videos ?? [],
      filled: Boolean(found),
    };
  });
}
