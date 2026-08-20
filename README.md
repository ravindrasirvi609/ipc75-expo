This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Hall 1C floor plan

An interactive, embeddable reproduction of `public/assets/ipc-hall-1c-plan.png`.
It is drawn as vector SVG in the source drawing's own coordinate space, so it
stays sharp at any zoom while matching the printed plan line for line.

| Route            | What it is                                              |
| ---------------- | ------------------------------------------------------- |
| `/floor-plan`    | The site page: plan, booking flow and the embed snippet |
| `/embed/hall-1c` | Chrome-free iframe target                               |
| `/api/stalls`    | `GET` availability, `POST` a hold request               |

### Embedding it elsewhere

```html
<iframe
  src="https://your-domain.example/embed/hall-1c"
  title="75th IPC - Hall 1C floor plan"
  width="100%"
  height="900"
  style="border:0"
  loading="lazy"
></iframe>
```

`/floor-plan` renders this snippet with the right origin already filled in, plus
a copy button. Query parameters:

- `?theme=dark` - dark widget chrome (the plan itself stays as printed)
- `?stall=1C-12,1C-11` - open zoomed onto those stalls, preselected

The frame talks to its host with `postMessage`. Every message carries
`source: "ipc75-floor-plan"`:

```js
window.addEventListener("message", (event) => {
  if (event.data?.source !== "ipc75-floor-plan") return;
  // { type: "selection",    stalls: ["1C-12"] }
  // { type: "hold-created", stalls: ["1C-12"], company: "..." }
  // { type: "height",       height: 902 }
});
```

Framing is allowed by a `frame-ancestors *` header on `/embed/*` in
`next.config.ts`; every other route stays `SAMEORIGIN`. Narrow that list to the
hosts you actually want before going live.

### Booking

Selecting stalls and submitting the form places a **hold** on them - visible to
everyone immediately, but provisional. An organiser promotes a hold to `booked`
by editing `data/stall-bookings.json`; see [data/README.md](data/README.md) for
the statuses, day-to-day edits and the deployment caveat.

Requests are all-or-nothing: if any stall in a selection was taken while the
visitor was choosing, the whole request is rejected with `409` and nothing is
held.

### Verifying the plan against the drawing

Two checks guard the reproduction. Both re-derive their expectations from the
original PNG rather than trusting the code.

```bash
npm run verify:plan     # 180 stalls, complete id runs, no overlaps,
                        # every cell matched to one detected in the image
npm run verify:render   # rasterise the vector plan and diff it with the source
```

`verify:render` writes `tmp/render-check/` including a `diff.png` - red is ink
only we drew, blue is ink only the original has. Text is reported but not
asserted: glyph rasterisation differs between the original export and librsvg.

Three quirks of the source artwork are reproduced deliberately:

- Two unlabelled solid-red cells inside the 1C blocks are structure, not stalls
  (which is what makes 1C add up to 58). They are never bookable.
- One stall is printed `1A-019`; it is `1A-19` everywhere in the data.
- One is printed just `39`; it is `1C-39` by position.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
