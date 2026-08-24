# Background media

Drop files in this folder to replace the stand-in. Every slot below already
shows a free Unsplash photo by default (wired in `lib/media.ts`) — nothing here
is required for the site to look finished. Add a licensed file with the
filename below and it takes over from the Unsplash fallback immediately.

## Files the site looks for

| Slot | Filename | Size | What it should show |
| --- | --- | --- | --- |
| Hero | `hero-floor.mp4` (and/or `.webm`) | 1920×1080, under 3 MB | Exhibition floor or plant-room footage. Slow movement, no on-screen text, 8–12 s seamless loop. |
| Hero | `hero-floor.jpg` | 1920×1080 | Poster for the video, and the fallback wherever the video does not play. **Add this even if you have the video.** |
| Exhibitor profile | `exhibitors-plant.jpg` | 1600×1000 | Powder processing or granulation equipment on a plant floor. |
| Visitor profile | `visitors-hall.jpg` | 1600×1000 | Delegates walking a trade-show aisle, faces not identifiable. |
| Charges | `charges-stand.jpg` | 1600×1000 | A built exhibition stand, three-quarter view. |
| Venue | `venue-yashobhoomi.jpg` | 2000×1200 | Yashobhoomi exterior or main concourse, daylight. |

Stills may be `.jpg`, `.jpeg`, `.png`, `.webp` or `.avif` — the first one found
wins. Supply plain JPEG and let Next.js generate WebP/AVIF and the responsive
sizes; there is no need to pre-optimise.

Run `npm run verify:content` to see which slots are filled.

## What the site does with them

Every backdrop sits under a scrim, so copy stays readable whatever the picture
contains. Pictures are deliberately faint — texture behind text, not photographs
to look at. The venue image drifts slowly as you scroll; the others hold still.

The hero video is skipped, and its poster shown instead, when any of these are
true: the screen is under 860 px, the visitor has data-saver on, the connection
reports 2G/3G, or the system asks for reduced motion. It is always muted and
never has controls, so it cannot interrupt anyone.

## Rights

Only put files here that you own or are licensed to publish. Photos of
identifiable people at past events need their consent; prefer wide aisle shots
where faces are not readable.
