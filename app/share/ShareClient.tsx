"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Download, ImagePlus, Loader2 } from "lucide-react";
import { EVENT, VENUE, ORGANISERS } from "@/lib/expo-content";

// ─── Types ────────────────────────────────────────────────────────────────────

/** A loaded image that can be drawn onto a canvas. */
type PhotoSource = {
  source: CanvasImageSource;
  width: number;
  height: number;
};

// ─── Canvas helpers ───────────────────────────────────────────────────────────

/**
 * Converts a data URL (produced by FileReader) to a Blob without using
 * fetch(), which is unreliable for data: URLs in some environments.
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
 * Loads a user photo as an ImageBitmap, requesting EXIF-aware orientation
 * via the `imageOrientation: "from-image"` option so phone photos are not
 * rendered sideways. Falls back to a plain HTMLImageElement on older browsers
 * that do not support createImageBitmap with orientation. Throws if the file
 * cannot be decoded at all — callers are expected to catch this and treat it
 * the same as "no photo".
 */
async function loadPhotoBitmap(dataUrl: string): Promise<PhotoSource> {
  const blob = dataUrlToBlob(dataUrl);
  try {
    const bmp = await createImageBitmap(blob, { imageOrientation: "from-image" });
    return { source: bmp, width: bmp.width, height: bmp.height };
  } catch {
    // Fallback for browsers that do not support the imageOrientation option.
    return loadImageAsSource(dataUrl);
  }
}

/**
 * Loads a plain image URL (same-origin; EXIF correction is not needed here
 * because logos do not carry orientation metadata). Rejects if the image
 * fails to load.
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
 * Resolves the (possibly absent) photo and logo assets a post needs.
 *
 * Split out from the drawing step deliberately: decoding an image takes a
 * variable amount of time, so if this is called twice in quick succession
 * (e.g. the user swaps photos before the first one finishes decoding), the
 * two calls can resolve in either order. Isolating "load" from "paint" lets
 * the caller check it is still the most recent request *before* touching
 * the canvas, so a slow, now-stale load can never overwrite a fresher one.
 *
 * Each asset is loaded independently — if the photo fails to decode, the
 * logo can still load, and vice versa.
 */
async function loadPostAssets(
  photoDataUrl: string | null,
  logoDataUrl: string | null
): Promise<{ photo: PhotoSource | null; logo: PhotoSource | null }> {
  const [photo, logo] = await Promise.all([
    photoDataUrl
      ? loadPhotoBitmap(photoDataUrl).catch((): PhotoSource | null => null)
      : Promise.resolve<PhotoSource | null>(null),
    logoDataUrl
      ? loadImageAsSource(logoDataUrl).catch((): PhotoSource | null => null)
      : Promise.resolve<PhotoSource | null>(null),
  ]);
  return { photo, logo };
}

/**
 * Draws a rounded-rectangle path into `ctx`. Uses the native canvas
 * `roundRect` API where available, falling back to arc-based segments
 * for browsers that do not yet support it.
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
  while (ctx.measureText(text).width > maxWidth && size > 32) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
}

// ─── Main drawing function ────────────────────────────────────────────────────

/**
 * Paints the social-media post into `ctx`. Synchronous and side-effect-free
 * beyond the canvas itself — `photo` and `logo` must already be resolved
 * (via loadPostAssets) before calling this, so a caller can always confirm
 * it is still the most recent request before any pixel is drawn.
 *
 * Layout coordinates are written for a 1080 × 1080 base grid. A single
 * `ctx.scale(size/1080, size/1080)` call at the top maps them uniformly, so
 * the same function drives both the 480-pixel live preview and the 1080-pixel
 * download without any duplicated logic.
 *
 * Content (dates, venue, etc.) is read from lib/expo-content so the post
 * always reflects the canonical facts for the exhibition.
 */
function paintPost(
  ctx: CanvasRenderingContext2D,
  size: number,
  name: string,
  photo: PhotoSource | null,
  logo: PhotoSource | null
): void {
  const B = 1080; // base grid dimension
  const s = size / B;

  ctx.save();
  ctx.scale(s, s);

  // ── Background gradient ──────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, B, B);
  bg.addColorStop(0, "#0a1a3a"); // --navy-deep
  bg.addColorStop(1, "#10254f"); // --navy
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, B, B);

  // ── Decorative concentric arcs (bottom-right) ────────────────────────────
  // Mirrors the hall-plan's concentric-ring motif used on the homepage hero.
  const arcDefs: [number, number][] = [
    [520, 0.14],
    [720, 0.1],
    [920, 0.07],
  ];
  for (const [r, alpha] of arcDefs) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(B, B, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#1b3568"; // --navy-soft
    ctx.lineWidth = 64;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.restore();
  }

  // ── Thin gold diagonal ribbon (top-right accent) ─────────────────────────
  ctx.save();
  ctx.translate(B, 0);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#c9a227"; // --gold
  ctx.globalAlpha = 0.13;
  ctx.fillRect(-15, -260, 30, 520);
  ctx.globalAlpha = 0.06;
  ctx.fillRect(-42, -260, 20, 520);
  ctx.restore();

  // ── Congress eyebrow (top-centre) ────────────────────────────────────────
  ctx.textAlign = "center";
  ctx.letterSpacing = "0.14em";
  ctx.font = '500 22px "IBM Plex Mono"';
  ctx.fillStyle = "#c9a227"; // --gold
  ctx.fillText(
    `${EVENT.parentShort.toUpperCase()} · ${EVENT.parent.toUpperCase().replace("75TH ", "")}`,
    B / 2,
    72
  );

  ctx.letterSpacing = "0.10em";
  ctx.font = '400 16px "IBM Plex Mono"';
  ctx.fillStyle = "#8a6f1a"; // --gold-dim
  ctx.fillText(
    `${EVENT.milestone.toUpperCase()} · ${ORGANISERS.hostShort} & ${ORGANISERS.congressShort}`,
    B / 2,
    106
  );

  // Thin gold rule below the eyebrow
  ctx.beginPath();
  ctx.moveTo(280, 124);
  ctx.lineTo(800, 124);
  ctx.strokeStyle = "rgba(201,162,39,0.28)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Photo circle (centre of the card) ────────────────────────────────────
  const cx = B / 2;
  const cy = 375;
  const r = 205;

  if (photo) {
    // Soft gold glow ring outside the photo
    const glow = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 24);
    glow.addColorStop(0, "rgba(201,162,39,0.28)");
    glow.addColorStop(1, "rgba(201,162,39,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 24, 0, Math.PI * 2);
    ctx.fill();

    // Solid gold ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 5;
    ctx.stroke();

    // Clip to circle and draw the photo with object-fit-cover cropping
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    const { source, width: imgW, height: imgH } = photo;
    let sx = 0, sy = 0, sw = imgW, sh = imgH;
    if (imgW > imgH) {
      // Landscape: crop the sides
      sw = imgH;
      sx = (imgW - sw) / 2;
    } else if (imgH > imgW) {
      // Portrait: crop top/bottom
      sh = imgW;
      sy = (imgH - sh) / 2;
    }
    ctx.drawImage(source, sx, sy, sw, sh, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  } else {
    // Placeholder — shown before upload, or if the photo failed to decode.
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
    ctx.font = '400 21px "IBM Plex Mono"';
    ctx.fillStyle = "#4d5f7d"; // --ink-soft
    ctx.textAlign = "center";
    ctx.fillText("YOUR PHOTO", cx, cy + 9);
  }

  // ── Attendee name ─────────────────────────────────────────────────────────
  const displayName = name.trim() || "Your Name";
  ctx.letterSpacing = "-0.02em";
  // Shrink font size if the name is wide, down to a 32px minimum.
  fitFontSize(ctx, displayName.toUpperCase(), B - 160, 76, 700, '"Inter"');
  ctx.fillStyle = name.trim() ? "#eaf0fa" : "#4d5f7d";
  ctx.textAlign = "center";
  ctx.fillText(displayName.toUpperCase(), B / 2, 655);

  // ── Attending tagline ──────────────────────────────────────────────────────
  ctx.letterSpacing = "0";
  ctx.font = '400 27px "Inter"';
  ctx.fillStyle = "#a9bcd8";
  ctx.fillText("is proudly attending the", B / 2, 708);

  ctx.font = '600 35px "Inter"';
  ctx.fillStyle = "#c9a227"; // --gold
  ctx.fillText(EVENT.parent, B / 2, 757);

  // ── Event detail strip ─────────────────────────────────────────────────────
  ctx.letterSpacing = "0.07em";
  ctx.font = '500 21px "IBM Plex Mono"';
  ctx.fillStyle = "#c9a227";
  ctx.fillText(EVENT.dates.label.toUpperCase(), B / 2, 820);

  ctx.letterSpacing = "0";
  ctx.font = '400 19px "Inter"';
  ctx.fillStyle = "#8fa5c6";
  ctx.fillText(`${VENUE.name}  ·  ${VENUE.city}`, B / 2, 856);

  // ── Gold divider rule ──────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(80, 894);
  ctx.lineTo(B - 80, 894);
  ctx.strokeStyle = "rgba(201,162,39,0.35)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // ── Footer: logo (left) · hashtags + URL (right) ──────────────────────────
  if (logo && logo.width > 0) {
    const logoH = 46;
    const logoW = Math.round((logo.width / logo.height) * logoH);
    const padX = 10;
    const padY = 7;
    const plateW = logoW + padX * 2;
    const plateH = logoH + padY * 2;
    const lx = 80;
    const ly = 913;

    // White backing plate — matches the `.lockup-logo { background: #fff }`
    // rule in site.css that always mounts the logo on a white ground.
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    roundRectPath(ctx, lx, ly, plateW, plateH, 4);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(logo.source, lx + padX, ly + padY, logoW, logoH);
  }

  // Hashtags
  ctx.letterSpacing = "0.04em";
  ctx.font = '400 17px "IBM Plex Mono"';
  ctx.fillStyle = "#4d5f7d"; // --ink-soft
  ctx.textAlign = "right";
  ctx.fillText("#75thIPC  #IndianPharmaceuticalCongress", B - 80, 940);

  // Website URL in gold — the key call-to-action on the post
  ctx.font = '500 19px "IBM Plex Mono"';
  ctx.fillStyle = "#c9a227";
  ctx.fillText(ORGANISERS.sites[0].label, B - 80, 968);

  ctx.restore(); // undo ctx.scale(s, s)
}

/** Releases a decoded ImageBitmap's memory. HTMLImageElement sources need no cleanup. */
function releasePhoto(photo: PhotoSource | null): void {
  if (photo?.source instanceof ImageBitmap) photo.source.close();
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Client-side generator. Manages the photo upload, name input, live preview
 * canvas, and the one-click PNG download.
 *
 * Intentionally self-contained: no API routes, no server calls, no new
 * dependencies. Everything runs in the browser.
 */
export default function ShareClient() {
  const [name, setName] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  /** Timer ref for debouncing name-driven preview redraws. */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Always mirrors the latest `photoDataUrl`. The debounced redraw in
   * handleNameChange reads this instead of the value closed over at
   * keystroke time, so a photo dropped during the debounce window is never
   * overwritten by the stale value once the timer fires.
   */
  const photoDataUrlRef = useRef<string | null>(null);
  /**
   * Monotonically increasing token identifying the most recently requested
   * render. Because loading a photo/logo is async and takes a variable
   * amount of time, two overlapping renderPreview calls (e.g. the user
   * swaps photos quickly) can have their asset-loading resolve out of
   * order. Each call captures the token at start and checks it again once
   * loading finishes; if a newer render has started in the meantime, this
   * call discards its result instead of painting a stale preview.
   */
  const renderGenerationRef = useRef(0);

  useEffect(() => {
    photoDataUrlRef.current = photoDataUrl;
  }, [photoDataUrl]);

  // Preload the site logo as a data URL once on mount. This ensures the
  // canvas can draw it without a second network round-trip at download time,
  // and avoids any potential same-origin header surprises.
  useEffect(() => {
    fetch("/assets/logo.png")
      .then((r) => {
        if (!r.ok) throw new Error("logo not found");
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
      .then(setLogoDataUrl)
      .catch(() => {
        // Logo is decorative — the post is still useful without it.
      });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Renders the preview canvas. Loads assets first, confirms this is still
  // the latest request, and only then paints — see renderGenerationRef above.
  const renderPreview = useCallback(
    async (currentName: string, currentPhoto: string | null) => {
      const generation = ++renderGenerationRef.current;

      // Wait for Inter and IBM Plex Mono to be fully loaded in the document
      // before drawing so canvas text matches the design intent.
      await document.fonts.ready;
      const { photo, logo } = await loadPostAssets(currentPhoto, logoDataUrl);

      if (generation !== renderGenerationRef.current) {
        // A newer render started while these assets were loading.
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
        paintPost(ctx, canvas.width, currentName, photo, logo);
      } catch (err) {
        console.error("Failed to render the post preview", err);
      } finally {
        releasePhoto(photo);
      }
    },
    [logoDataUrl]
  );

  // Redraw when the photo or logo arrives. Name changes are handled via the
  // debounced path in handleNameChange to avoid a canvas flush on every keystroke.
  useEffect(() => {
    renderPreview(name, photoDataUrl);
    // `name` is intentionally excluded: debounce in handleNameChange covers it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoDataUrl, logoDataUrl, renderPreview]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => renderPreview(value, photoDataUrlRef.current),
      350
    );
  };

  // Reads an image File via FileReader and stores it as a data URL.
  const loadPhoto = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPhotoDataUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadPhoto(file);
    // Reset so the same file can be re-selected if the user wants to try again.
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadPhoto(file);
  };

  // Generates the full-resolution 1080 × 1080 canvas off-screen, then
  // triggers a browser download. A separate off-screen canvas keeps the
  // preview unaffected while the download renders.
  const handleDownload = async () => {
    if (!name.trim() || !photoDataUrl) return;
    setGenerating(true);
    setDownloadError(null);
    let photo: PhotoSource | null = null;
    try {
      await document.fonts.ready;
      const assets = await loadPostAssets(photoDataUrl, logoDataUrl);
      photo = assets.photo;

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported in this browser.");

      paintPost(ctx, 1080, name, photo, assets.logo);

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      // Slugify the name so the filename is clean on all OSes.
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
          {/*
           * The real <input type="file"> is visually hidden via .sr-only.
           * The <label> below is the styled drop zone. Screen-readers
           * reach the input via its id="share-photo".
           */}
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
                {/* Plain <img>, not next/image, because the src is a blob data
                    URL which next/image's optimisation pipeline cannot serve. */}
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
        {/*
         * The canvas renders at 480 × 480 logical pixels. On HiDPI screens it
         * will appear slightly soft — that is expected for a preview. The
         * downloaded file is 1080 × 1080, generated from a separate off-screen
         * canvas, so it is always sharp.
         */}
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
