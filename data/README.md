# Stall availability seed

Hall 1C availability lives in Supabase Postgres (table `stall_bookings`), not
here. `stall-bookings.json` is the one-time seed fixture `npm run db:seed`
loads into that table — useful as a readable snapshot of where bookings
stood at some point, but editing it after the initial seed changes nothing
that visitors or the admin desk see. Anything **not** listed in it was
available as of `updatedAt`.

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

Bookings are managed live, at `/admin` (organiser sign-in required):

- **Confirm a hold** — open the request and choose "Confirm booking"; sets
  `status` to `booked`.
- **Return to hold** — the same screen, in reverse.
- **Add a booking made offline** — run the exhibitor's request through the
  normal `/floor-plan` flow yourself, then confirm it from `/admin`.

There's no "release a stall" action yet — deleting a mistaken hold means
removing its row directly in the Supabase table editor.

`company` is the only field the public API (`/api/stalls`) ever serves.
`contact`, `email`, `phone` and `note` are readable only by an authorised
organiser, through `/api/admin/bookings`.

## Updating this seed file

If you want `stall-bookings.json` to reflect current reality (for a fresh
`db:seed` into a new environment, say), export the current state from
Supabase and overwrite it. It only ever holds `status` and `company` — never
`contact`/`email`/`phone`/`note` — so it's safe to keep in git. Run
`npm run verify:plan` after editing: it fails if a stall id in the file
doesn't exist in Hall 1C.

## Concurrency

Availability reads and the hold-request RPC both run against Postgres, which
serialises the conflict check, so two simultaneous requests can't both win
the same stall — this holds regardless of how many server instances are
running. See `supabase/migrations/` for the `request_stall_hold` function
that enforces it.
