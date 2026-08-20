# Stall availability store

`stall-bookings.json` is the source of truth for which Hall 1C stalls are taken.
Anything **not** listed in it is available.

```jsonc
{
  "hall": "1C",
  "updatedAt": "2026-08-20T06:00:00.000Z",
  "stalls": {
    "1C-12": { "status": "booked", "company": "Helix Remedies" },
  },
}
```

## Statuses

| status   | meaning                                        | on the plan       |
| -------- | ---------------------------------------------- | ----------------- |
| `booked` | confirmed and paid for; locked                 | dark graphite     |
| `hold`   | a request came in, nobody has confirmed it yet | amber             |
| absent   | available                                      | white, as printed |

## Day-to-day edits

- **Confirm a hold** — change its `status` from `hold` to `booked`.
- **Release a stall** — delete its entry.
- **Add a booking made offline** — add an entry with `status: "booked"` and the
  exhibitor's `company`.

`company` is the only field shown publicly. Run `npm run verify:plan` after
editing: it fails if a stall id in this file does not exist in Hall 1C.

## Privacy

When someone submits a request through the site, their `contact`, `email`,
`phone` and `note` are written into this file alongside the hold. The API never
serves those fields — but they are personal data sitting in your working tree,
so **review before committing** and consider keeping the live file out of git
once real requests start arriving.

## Deployment

The file is read and written with `node:fs`, which assumes one long-lived server
process (`next start`, a container, a VM). On serverless or multi-instance
hosting, two requests can hold the same stall. Swap `readStore`/`writeStore` in
`lib/stall-bookings.ts` for a real database before that matters — nothing else
in the app touches the storage layer.
