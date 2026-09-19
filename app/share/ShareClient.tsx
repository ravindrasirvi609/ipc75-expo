"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Download, ImagePlus, Loader2 } from "lucide-react";
import { EVENT, VENUE, ORGANISERS } from "@/lib/expo-content";

// ─── Types ────────────────────────────────────────────────────────────────────

/** A resolved image ready to be blitted onto a canvas. */
type PhotoSource = {
  source: CanvasImageSource;
  width: number;
  height: number;
};

// ─── Image-loading helpers ────────────────────────────────────────────────────

/**
 * Converts a data URL (produced by FileReader) to a Blob without fetch(),
 * which is unreliable for data: URLs in some environments.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Loads a user photo as an ImageBitmap, requesting EXIF-aware orientation via
 * `imageOrientation: "from-image"` so phone portraits render upright in canvas.
 * Falls back to HTMLImageElement on browsers that do not support the option.
 * Throws if the image cannot be decoded at all.
 */
async function loadPhotoBitmap(dataUrl: string): Promise<PhotoSource> {
  const blob = dataUrlToBlob(dataUrl);
  try {
    const bmp = await createImageBitmap(blob, { imageOrientation: "from-image" });
    return { source: bmp, width: bmp.width, height: bmp.height };
  } catch {
    return loadImageAsSource(dataUrl);
  }
}

/**
 * Loads an image from a URL (same-origin; logos do not need EXIF correction).
 */
function loadImageAsSource(src: string): Promise<PhotoSource> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Loads only the user's photo (logos are preloaded once into component state
 * and passed directly to paintPost, so they are never re-fetched per render).
 */
async function loadPhotoAsset(
  photoDataUrl: string | null
): Promise<PhotoSource | null> {
  if (!photoDataUrl) return null;
  return loadPhotoBitmap(photoDataUrl).catch(() => null);
}

/** Closes an ImageBitmap to free GPU-decoded memory. No-op for HTMLImageElement. */
function releasePhoto(photo: PhotoSource | null): void {
  if (photo?.source instanceof ImageBitmap) photo.source.close();
}

// ─── Canvas drawing helpers ───────────────────────────────────────────────────

/**
 * Draws a rounded-rectangle path. Uses the native canvas API where available,
 * falls back to arc-based segments for older browsers.
 */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Reduces `fontSize` in 2px steps until `text` fits within `maxWidth`.
 * Leaves `ctx.font` set to the final size used.
 */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  weight: number | string,
  family: string
): void {
  let size = initialSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 28) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
}

// ─── Main drawing function ────────────────────────────────────────────────────

/**
 * Renders the social post into `ctx`. Fully synchronous — photo and logo
 * sources must be pre-resolved via loadPhotoAsset / loadImageAsSource before
 * calling this, so the caller can confirm it is still the most-recent request
 * before any pixel is drawn (see renderGenerationRef in the component below).
 *
 * All coordinates are in a 1080 × 1080 base grid; a ctx.scale(size/1080)
 * at the top maps them for any output size (preview or full-res download).
 *
 * Design: premium navy ground with a rich multi-stop gradient, Indian tricolor
 * accent stripe at the top edge, the official IPC logo image as a header,
 * the user's photo in a gold-to-saffron gradient ring, shimmer gradient on
 * the congress name, and OPF co-branding in the footer.
 */
function paintPost(
  ctx: CanvasRenderingContext2D,
  size: number,
  name: string,
  photo: PhotoSource | null,
  ipcLogo: PhotoSource | null,
  opfLogo: PhotoSource | null
): void {
  const B = 1080;
  const s = size / B;

  ctx.save();
  ctx.scale(s, s);

  // ── Rich multi-stop background ───────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, B * 0.7, B);
  bg.addColorStop(0, "#060f1e");
  bg.addColorStop(0.28, "#0a1a3a"); // --navy-deep
  bg.addColorStop(0.6, "#10254f"); // --navy
  bg.addColorStop(1, "#0b1c3c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, B, B);

  // Warm gold halo behind the logo area at the top
  const topHalo = ctx.createRadialGradient(B / 2, 0, 0, B / 2, 0, 420);
  topHalo.addColorStop(0, "rgba(201,162,39,0.16)");
  topHalo.addColorStop(1, "rgba(201,162,39,0)");
  ctx.fillStyle = topHalo;
  ctx.fillRect(0, 0, B, 440);

  // Saffron warmth at the bottom — anchors the Indian-palette feel
  const btmHalo = ctx.createRadialGradient(B / 2, B, 0, B / 2, B, 540);
  btmHalo.addColorStop(0, "rgba(228,118,27,0.09)");
  btmHalo.addColorStop(1, "rgba(228,118,27,0)");
  ctx.fillStyle = btmHalo;
  ctx.fillRect(0, B - 460, B, 460);

  // Teal accent glow at left-centre — adds a third colour note
  const tealHalo = ctx.createRadialGradient(0, B * 0.5, 0, 0, B * 0.5, 340);
  tealHalo.addColorStop(0, "rgba(42,118,180,0.08)");
  tealHalo.addColorStop(1, "rgba(42,118,180,0)");
  ctx.fillStyle = tealHalo;
  ctx.fillRect(0, B * 0.25, 360, B * 0.5);

  // ── Decorative concentric arcs (bottom-right) ────────────────────────────
  const arcsDR: [number, number][] = [[510, 0.13], [710, 0.09], [910, 0.06]];
  for (const [r, alpha] of arcsDR) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(B, B, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#1b3568"; // --navy-soft
    ctx.lineWidth = 60;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.restore();
  }

  // Mirrored arcs top-left for balance
  const arcsTL: [number, number][] = [[260, 0.07], [390, 0.05]];
  for (const [r, alpha] of arcsTL) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#1b3568";
    ctx.lineWidth = 48;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.restore();
  }

  // ── Subtle gold ribbon along the right edge ───────────────────────────────
  ctx.save();
  ctx.translate(B, 0);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#c9a227";
  ctx.globalAlpha = 0.11;
  ctx.fillRect(-13, -260, 26, 520);
  ctx.globalAlpha = 0.04;
  ctx.fillRect(-38, -260, 17, 520);
  ctx.restore();

  // ── Indian tricolor accent stripe (top edge) ─────────────────────────────
  const stripeH = 7;
  ctx.fillStyle = "#FF9933"; // Saffron
  ctx.fillRect(0, 0, B / 3, stripeH);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(B / 3, 0, B / 3, stripeH);
  ctx.fillStyle = "#138808"; // India green
  ctx.fillRect((2 * B) / 3, 0, B / 3, stripeH);

  // ── "PLATINUM JUBILEE" corner ribbon (top-right) ──────────────────────────
  // A classic corner-ribbon badge rendered diagonally across the top-right
  // corner. The saffron-to-gold gradient pulls the two Indian-palette accent
  // colours together into a single striking element. The ribbon intentionally
  // runs partly off-canvas — that clipped look is the standard corner-badge
  // convention (think e-commerce "SALE" ribbons).
  {
    const ribbonGrad = ctx.createLinearGradient(-200, 0, 200, 0);
    ribbonGrad.addColorStop(0, "#e4761b"); // --saffron
    ribbonGrad.addColorStop(0.5, "#f0a050"); // warm amber midpoint
    ribbonGrad.addColorStop(1, "#c9a227"); // --gold
    ctx.save();
    ctx.translate(B - 20, 20);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = ribbonGrad;
    ctx.fillRect(-220, -19, 440, 38);
    // Thin white borders on the ribbon edges for definition
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-220, -19, 440, 38);
    // Ribbon text
    ctx.textAlign = "center";
    ctx.letterSpacing = "0.14em";
    ctx.font = '700 13px "IBM Plex Mono"';
    ctx.fillStyle = "#ffffff";
    ctx.fillText("PLATINUM JUBILEE", 0, 5);
    ctx.restore();
  }

  // ── IPC logo plate (top centre) ───────────────────────────────────────────
  if (ipcLogo && ipcLogo.width > 0) {
    const lh = 74;
    const lw = Math.round((ipcLogo.width / ipcLogo.height) * lh); // ≈277
    const px = 14, py = 10;
    const plateX = Math.round((B - lw) / 2) - px;
    const plateY = 18;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    roundRectPath(ctx, plateX, plateY, lw + px * 2, lh + py * 2, 7);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(ipcLogo.source, plateX + px, plateY + py, lw, lh);
  } else {
    ctx.letterSpacing = "0.14em";
    ctx.font = '500 20px "IBM Plex Mono"';
    ctx.fillStyle = "#c9a227";
    ctx.textAlign = "center";
    ctx.fillText("75TH INDIAN PHARMACEUTICAL CONGRESS", B / 2, 72);
  }

  // ── Expo name + venue subtitle ────────────────────────────────────────────
  // Associates the user's post with the specific exhibition (not just the
  // congress) and grounds it in the host city. Teal adds a fourth hue.
  ctx.letterSpacing = "0.08em";
  ctx.font = '500 13px "IBM Plex Mono"';
  ctx.fillStyle = "#6db8d4"; // teal-blue accent — distinct from gold/saffron
  ctx.textAlign = "center";
  ctx.fillText(
    `${EVENT.shortName.toUpperCase()}  ·  ${VENUE.city.toUpperCase()}, INDIA`,
    B / 2,
    130
  );

  // Thin gold rule
  ctx.beginPath();
  ctx.moveTo(220, 148);
  ctx.lineTo(860, 148);
  ctx.strokeStyle = "rgba(201,162,39,0.28)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Photo circle ─────────────────────────────────────────────────────────
  const cx = B / 2;
  const cy = 322;
  const r = 158;

  if (photo) {
    // Layered glow: gold inner halo, saffron outer warmth
    const glow = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r + 44);
    glow.addColorStop(0, "rgba(201,162,39,0.24)");
    glow.addColorStop(0.5, "rgba(228,118,27,0.10)");
    glow.addColorStop(1, "rgba(201,162,39,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 44, 0, Math.PI * 2);
    ctx.fill();

    // Gradient ring: gold → bright amber → saffron
    const ringGrad = ctx.createLinearGradient(
      cx - r - 10, cy - r - 10,
      cx + r + 10, cy + r + 10
    );
    ringGrad.addColorStop(0, "#c9a227");
    ringGrad.addColorStop(0.35, "#f2cc50");
    ringGrad.addColorStop(0.68, "#e4761b"); // --saffron
    ringGrad.addColorStop(1, "#c9a227");
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Clip + draw photo (object-fit: cover)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const { source, width: imgW, height: imgH } = photo;
    let sx = 0, sy = 0, sw = imgW, sh = imgH;
    if (imgW > imgH) { sw = imgH; sx = (imgW - sw) / 2; }
    else if (imgH > imgW) { sh = imgW; sy = (imgH - sh) / 2; }
    ctx.drawImage(source, sx, sy, sw, sh, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#0d1e3d";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#1b3568";
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 9]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.letterSpacing = "0.12em";
    ctx.font = '400 20px "IBM Plex Mono"';
    ctx.fillStyle = "#4d5f7d";
    ctx.textAlign = "center";
    ctx.fillText("YOUR PHOTO", cx, cy + 8);
  }

  // ── "REGISTERED DELEGATE" badge ───────────────────────────────────────────
  // A pill-shaped chip that hangs just below the photo ring, styled in the
  // site's --green confirmation colour (#067a46). Adds both content and a
  // strong fourth colour to the palette alongside navy, gold and saffron.
  {
    const badgeLabel = "REGISTERED DELEGATE";
    ctx.letterSpacing = "0.10em";
    ctx.font = '700 12px "IBM Plex Mono"';
    const tw = ctx.measureText(badgeLabel).width;
    const bPadX = 20, bPadY = 9;
    const bw = tw + bPadX * 2;
    const bh = 30;
    const bx = cx - bw / 2;
    // Position: top of pill sits at ring's outer edge so it "hangs" off the circle
    const by = cy + r + 2;

    ctx.save();
    ctx.beginPath();
    roundRectPath(ctx, bx, by, bw, bh, bh / 2);
    ctx.fillStyle = "#067a46"; // --green
    ctx.fill();
    ctx.strokeStyle = "rgba(201,162,39,0.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(badgeLabel, cx, by + bPadY + 3);
  }

  // ── Attendee name ─────────────────────────────────────────────────────────
  const displayName = name.trim() || "Your Name";
  ctx.letterSpacing = "-0.02em";
  fitFontSize(ctx, displayName.toUpperCase(), B - 160, 66, 700, '"Inter"');
  ctx.fillStyle = name.trim() ? "#f5eed8" : "#4d5f7d"; // warm cream
  ctx.textAlign = "center";
  // Badge bottom = cy+r+2+30 = cy+r+32. Name starts ~22px below badge.
  const nameLine = cy + r + 32 + 58;
  ctx.fillText(displayName.toUpperCase(), B / 2, nameLine);

  // ── Tagline ───────────────────────────────────────────────────────────────
  ctx.letterSpacing = "0";
  ctx.font = '400 23px "Inter"';
  ctx.fillStyle = "#a9bcd8";
  ctx.fillText("is proudly attending the", B / 2, nameLine + 46);

  // ── Congress name — shimmer gradient ──────────────────────────────────────
  const shimmer = ctx.createLinearGradient(240, 0, B - 240, 0);
  shimmer.addColorStop(0, "#c9a227");
  shimmer.addColorStop(0.45, "#f4d060");
  shimmer.addColorStop(0.55, "#f4d060");
  shimmer.addColorStop(1, "#c9a227");
  ctx.font = '600 31px "Inter"';
  ctx.fillStyle = shimmer;
  ctx.fillText(EVENT.parent, B / 2, nameLine + 90);

  // ── Event theme ────────────────────────────────────────────────────────────
  ctx.letterSpacing = "0.07em";
  ctx.font = '400 13px "IBM Plex Mono"';
  ctx.fillStyle = "#8a6f1a"; // --gold-dim
  ctx.fillText(EVENT.theme.toUpperCase(), B / 2, nameLine + 118);

  // ── "Hosted by IPGA · Organised by IPCA" ──────────────────────────────────
  // Surfaces the organiser credits and introduces teal/blue into the text layer
  // as a colour note separate from the gold-and-saffron palette.
  ctx.letterSpacing = "0.06em";
  ctx.font = '500 12px "IBM Plex Mono"';
  ctx.fillStyle = "#6db8d4"; // teal-blue — matches the subtitle line above
  ctx.fillText(
    `HOSTED BY ${ORGANISERS.hostShort}  ·  ORGANISED BY ${ORGANISERS.congressShort}`,
    B / 2,
    nameLine + 143
  );

  // Short centred rule
  ctx.beginPath();
  ctx.moveTo(330, nameLine + 165);
  ctx.lineTo(750, nameLine + 165);
  ctx.strokeStyle = "rgba(201,162,39,0.22)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Dates ─────────────────────────────────────────────────────────────────
  ctx.letterSpacing = "0.07em";
  ctx.font = '500 19px "IBM Plex Mono"';
  ctx.fillStyle = "#c9a227";
  ctx.fillText(EVENT.dates.label.toUpperCase(), B / 2, nameLine + 192);

  // Days of week in a subtler warm colour
  ctx.letterSpacing = "0.05em";
  ctx.font = '400 13px "IBM Plex Mono"';
  ctx.fillStyle = "#c8a846"; // slightly muted gold
  ctx.fillText(EVENT.dates.days.toUpperCase(), B / 2, nameLine + 213);

  // ── Venue · City · Hall ───────────────────────────────────────────────────
  ctx.letterSpacing = "0";
  ctx.font = '400 16px "Inter"';
  ctx.fillStyle = "#8fa5c6";
  ctx.fillText(`${VENUE.name}  ·  ${VENUE.city}  ·  ${VENUE.hall}`, B / 2, nameLine + 238);

  // ── Major gold divider ────────────────────────────────────────────────────
  const divY = nameLine + 272;
  ctx.beginPath();
  ctx.moveTo(80, divY);
  ctx.lineTo(B - 80, divY);
  ctx.strokeStyle = "rgba(201,162,39,0.40)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Footer: logos (left) + hashtags / URL (right) ────────────────────────
  const footerTop = divY + 22;
  const logoH = 44;
  let nextX = 80;

  if (ipcLogo && ipcLogo.width > 0) {
    const lw = Math.round((ipcLogo.width / ipcLogo.height) * logoH); // ≈164
    const px = 10, py = 7;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    roundRectPath(ctx, nextX, footerTop, lw + px * 2, logoH + py * 2, 4);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(ipcLogo.source, nextX + px, footerTop + py, lw, logoH);
    nextX += lw + px * 2 + 10;
  }

  if (opfLogo && opfLogo.width > 0) {
    const lw = Math.round((opfLogo.width / opfLogo.height) * logoH); // ≈35
    const px = 10, py = 7;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    roundRectPath(ctx, nextX, footerTop, lw + px * 2, logoH + py * 2, 4);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(opfLogo.source, nextX + px, footerTop + py, lw, logoH);
  }

  // Hashtags
  ctx.letterSpacing = "0.04em";
  ctx.font = '400 15px "IBM Plex Mono"';
  ctx.fillStyle = "#4d5f7d";
  ctx.textAlign = "right";
  ctx.fillText("#75thIPC  #IndianPharmaceuticalCongress", B - 80, footerTop + 22);

  // URL in gold
  ctx.font = '500 17px "IBM Plex Mono"';
  ctx.fillStyle = "#c9a227";
  ctx.fillText(ORGANISERS.sites[0].label, B - 80, footerTop + 46);

  ctx.restore(); // undo ctx.scale(s, s)
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Client-side generator. Logos are preloaded once into component state on
 * mount so the canvas never needs a second network request. The user's photo
 * is loaded per-render (it changes) with EXIF-aware orientation correction.
 *
 * Race prevention: each renderPreview call captures a monotonically increasing
 * generation token before its async photo-load, then confirms it is still the
 * most-recent request before touching the canvas — so two overlapping calls
 * (e.g. rapid photo swaps) never paint out of order.
 */
export default function ShareClient() {
  const [name, setName] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // Logos are loaded once on mount and stored as PhotoSource objects so
  // paintPost never needs to re-decode them on every render.
  const [ipcLogoSource, setIpcLogoSource] = useState<PhotoSource | null>(null);
  const [opfLogoSource, setOpfLogoSource] = useState<PhotoSource | null>(null);

  const [generating, setGenerating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  /** Timer ref for debouncing name-driven preview redraws. */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Always mirrors the latest photoDataUrl so the debounced name-redraw
   * reads the current photo rather than the value closed over at keystroke time.
   */
  const photoDataUrlRef = useRef<string | null>(null);
  /**
   * Generation token: incremented on every renderPreview call. A render
   * whose async photo-load resolves after a newer one has started discards
   * its result instead of overwriting a fresher preview.
   */
  const renderGenerationRef = useRef(0);

  // Keep the photoDataUrl ref in sync with state.
  useEffect(() => {
    photoDataUrlRef.current = photoDataUrl;
  }, [photoDataUrl]);

  // Preload both logos once on mount. Stored as PhotoSource (HTMLImageElement)
  // so paintPost can drawImage() them directly with no per-render fetch.
  useEffect(() => {
    const loadLogo = (path: string, setter: (v: PhotoSource | null) => void) => {
      fetch(path)
        .then((r) => {
          if (!r.ok) throw new Error(`${path} not found`);
          return r.blob();
        })
        .then(
          (blob) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            })
        )
        .then((dataUrl) => loadImageAsSource(dataUrl))
        .then(setter)
        .catch(() => {
          // Logo is optional — the post remains useful without it.
        });
    };

    loadLogo("/assets/ipc-logo.png", setIpcLogoSource);
    loadLogo("/assets/opf-logo.png", setOpfLogoSource);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Renders the preview canvas. Logo sources come from component state (loaded
  // once); only the user's photo is loaded per-call (it changes).
  const renderPreview = useCallback(
    async (currentName: string, currentPhoto: string | null) => {
      const generation = ++renderGenerationRef.current;

      // Wait for Inter and IBM Plex Mono to load so canvas text matches the font
      await document.fonts.ready;
      const photo = await loadPhotoAsset(currentPhoto);

      // Bail if a newer render started while the photo was decoding.
      if (generation !== renderGenerationRef.current) {
        releasePhoto(photo);
        return;
      }

      const canvas = previewCanvasRef.current;
      if (!canvas) {
        releasePhoto(photo);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        releasePhoto(photo);
        return;
      }

      try {
        paintPost(ctx, canvas.width, currentName, photo, ipcLogoSource, opfLogoSource);
      } catch (err) {
        console.error("Failed to render the post preview", err);
      } finally {
        releasePhoto(photo);
      }
    },
    // Re-creates when either logo finishes loading so the preview updates.
    [ipcLogoSource, opfLogoSource]
  );

  // Redraw when the photo changes or when a logo finishes loading (logos make
  // renderPreview a new function, which triggers this effect).
  useEffect(() => {
    renderPreview(name, photoDataUrl);
    // `name` is intentionally omitted: debounce in handleNameChange covers it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoDataUrl, renderPreview]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Read the ref (not the closed-over `photoDataUrl`) so a photo dropped
    // during the debounce window is not silently reverted.
    debounceRef.current = setTimeout(
      () => renderPreview(value, photoDataUrlRef.current),
      350
    );
  };

  const loadPhoto = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPhotoDataUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadPhoto(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadPhoto(file);
  };

  // Generates the full-resolution 1080 × 1080 PNG off-screen and triggers
  // a browser download. Uses the same logo sources already loaded in state.
  const handleDownload = async () => {
    if (!name.trim() || !photoDataUrl) return;
    setGenerating(true);
    setDownloadError(null);
    let photo: PhotoSource | null = null;
    try {
      await document.fonts.ready;
      photo = await loadPhotoAsset(photoDataUrl);

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported in this browser.");

      paintPost(ctx, 1080, name, photo, ipcLogoSource, opfLogoSource);

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `75ipc-${name.trim().replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate the post", err);
      setDownloadError(
        "Something went wrong generating your post. Please try again, or try a different photo."
      );
    } finally {
      releasePhoto(photo);
      setGenerating(false);
    }
  };

  const canDownload = name.trim().length > 0 && photoDataUrl !== null;

  return (
    <div className="share-grid">
      {/* ── Form (left column) ──────────────────────────────────────────── */}
      <div className="share-form">
        <div className="share-field">
          <label className="share-label" htmlFor="share-name">
            Your name
          </label>
          <input
            id="share-name"
            className="share-input"
            type="text"
            placeholder="Dr. Priya Sharma"
            value={name}
            maxLength={40}
            onChange={handleNameChange}
          />
        </div>

        <div className="share-field">
          <span className="share-label" id="share-photo-label">
            Your photo
          </span>
          <input
            id="share-photo"
            className="sr-only"
            type="file"
            accept="image/*"
            aria-labelledby="share-photo-label"
            onChange={handleFileInput}
          />
          <label
            htmlFor="share-photo"
            className={[
              "share-upload",
              dragging && "is-dragging",
              photoDataUrl && "has-photo",
            ]
              .filter(Boolean)
              .join(" ")}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {photoDataUrl ? (
              <>
                {/* Plain <img>, not next/image: the src is a blob data URL
                    which next/image's optimisation pipeline cannot handle. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="share-thumb"
                  src={photoDataUrl}
                  alt="Your uploaded photo"
                />
                <span className="share-upload-swap">Click to change</span>
              </>
            ) : (
              <>
                <ImagePlus
                  size={26}
                  strokeWidth={1.5}
                  className="share-upload-icon"
                  aria-hidden="true"
                />
                <span className="share-upload-main">
                  Click or drag to upload your photo
                </span>
                <span className="share-upload-sub">JPG · PNG · WEBP</span>
              </>
            )}
          </label>
        </div>

        <button
          type="button"
          className="btn btn-primary share-download-btn"
          onClick={handleDownload}
          disabled={!canDownload || generating}
        >
          {generating ? (
            <>
              <Loader2
                size={14}
                strokeWidth={1.75}
                className="share-spin"
                aria-hidden="true"
              />
              Generating…
            </>
          ) : (
            <>
              <Download size={14} strokeWidth={1.75} aria-hidden="true" />
              Download PNG
            </>
          )}
        </button>

        {downloadError ? (
          <p className="share-error" role="alert">
            {downloadError}
          </p>
        ) : !canDownload ? (
          <p className="share-hint">
            {!photoDataUrl && !name.trim()
              ? "Add your photo and name to unlock the download."
              : !photoDataUrl
                ? "Upload your photo to unlock the download."
                : "Enter your name to unlock the download."}
          </p>
        ) : null}
      </div>

      {/* ── Preview (right column) ──────────────────────────────────────── */}
      <div className="share-preview">
        <p className="data-label share-preview-label">Live preview</p>
        <div className="share-preview-frame">
          <canvas
            ref={previewCanvasRef}
            width={480}
            height={480}
            className="share-canvas"
            aria-label="Social media post preview"
          />
        </div>
        <p className="share-preview-note">
          1080 × 1080 px — ideal for Instagram, LinkedIn, WhatsApp and X.
        </p>
      </div>
    </div>
  );
}
