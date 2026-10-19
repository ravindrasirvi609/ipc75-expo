import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Files the email and PDF need at send time (logo, fonts). They live in
 * `server-assets/`, outside `public/`, because they are only ever read by the
 * server. next.config.ts lists that folder for the send route so it is
 * bundled with the deployment. Server-only: never import from a Client
 * Component.
 */
const cache = new Map<string, Promise<Uint8Array>>();

export function readAsset(relativePath: string): Promise<Uint8Array> {
  let file = cache.get(relativePath);
  if (!file) {
    file = readFile(path.join(process.cwd(), "server-assets", relativePath));
    cache.set(relativePath, file);
    // Don't cache a failure: a missing file should be retried after it's fixed.
    file.catch(() => cache.delete(relativePath));
  }
  return file;
}
