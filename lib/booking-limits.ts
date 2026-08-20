/**
 * Limits shared by the server and the browser.
 *
 * These live apart from `stall-bookings.ts` because that module reaches for
 * `node:fs` — importing it from a client component drags the filesystem into
 * the browser bundle and the build fails. Anything both sides need goes here.
 */

/** Most stalls one request may cover. Enforced by the API, shown in the UI. */
export const MAX_STALLS_PER_REQUEST = 20;
