/**
 * Resolves background media for the homepage bands from `public/assets/media/`,
 * falling back to a stand-in Unsplash photo when no local file exists.
 *
 * Server-side only — it touches the filesystem. Every slot still works with no
 * local file at all: `resolveBackdrop` hands back the slot's Unsplash fallback
 * instead of nothing, so the site ships with real photography from day one.
 * Drop a licensed file into the media folder and it wins over the fallback —
 * nothing else about the section changes.
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
  /** Unsplash stand-in, used only while no local file exists for this slot. */
  fallback: string;
};

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?q=80&w=2000&auto=format&fit=crop`;

export const MEDIA_MANIFEST: Record<BackdropSlot, SlotSpec> = {
  hero: {
    base: "hero-floor",
    video: true,
    brief:
      "Exhibition floor or plant-room footage, slow movement, no on-screen text. 8–12s seamless loop.",
    size: "1920×1080",
    fallback: unsplash("1551884170-09fb70a3a2ed"),
  },
  exhibitors: {
    base: "exhibitors-plant",
    video: false,
    brief: "Powder processing or granulation equipment on a plant floor.",
    size: "1600×1000",
    fallback: unsplash("1513828170880-00eeeac21306"),
  },
  visitors: {
    base: "visitors-hall",
    video: false,
    brief: "Delegates walking a trade-show aisle, faces not identifiable.",
    size: "1600×1000",
    fallback: unsplash("1761195696518-6384573549ea"),
  },
  charges: {
    base: "charges-stand",
    video: false,
    brief: "A built exhibition stall, three-quarter view.",
    size: "1600×1000",
    fallback: unsplash("1632383380175-812d44ec112b"),
  },
  venue: {
    base: "venue-yashobhoomi",
    video: false,
    brief: "Yashobhoomi exterior or main concourse, daylight.",
    size: "2000×1200",
    fallback: unsplash("1713729991304-d0b6c328560e"),
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
 * What exists on disk for one slot, or its Unsplash fallback if nothing does.
 * A slot is only ever `null` if it had a local video with no poster at all —
 * every other case has an image to show.
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

  if (!image && !videos.length) return { image: spec.fallback, videos: [] };
  return { image: image ?? spec.fallback, videos };
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
