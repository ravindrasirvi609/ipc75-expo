"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, Moon, Share2, Sun } from "lucide-react";

const EMBED_PATH = "/embed/hall-1c";
const THEME_ICON = { light: Sun, dark: Moon } as const;

/**
 * Shows the ready-to-paste iframe for the floor plan. `origin` comes from the
 * request on the server, so the snippet is right on localhost, staging and
 * production without any client-side guessing.
 */
export default function EmbedSnippet({ origin }: { origin: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState(false);

  const url = `${origin}${EMBED_PATH}${theme === "dark" ? "?theme=dark" : ""}`;
  const snippet = `<iframe
  src="${url}"
  title="75th IPC — Hall 1C floor plan"
  width="100%"
  height="900"
  style="border:0"
  loading="lazy"
></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="embed-card">
      <header>
        <div>
          <p className="eyebrow coral">
            <Share2 size={13} strokeWidth={1.75} aria-hidden="true" />
            Share it anywhere
          </p>
          <h2>Embed this plan</h2>
          <p className="embed-copy">
            Paste this into any site — sponsor microsite, association page, an
            email landing page. The plan, availability and the booking form all
            travel with it.
          </p>
        </div>
        <div className="embed-actions">
          <div className="embed-theme" role="group" aria-label="Embed theme">
            {(["light", "dark"] as const).map((option) => {
              const ThemeIcon = THEME_ICON[option];
              return (
                <button
                  key={option}
                  type="button"
                  className={theme === option ? "is-on" : ""}
                  onClick={() => setTheme(option)}
                >
                  <ThemeIcon size={12} strokeWidth={1.75} aria-hidden="true" />
                  {option}
                </button>
              );
            })}
          </div>
          <a
            className="embed-open"
            href={`${EMBED_PATH}${theme === "dark" ? "?theme=dark" : ""}`}
            target="_blank"
            rel="noreferrer"
          >
            Open standalone
            <ArrowUpRight size={12} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </header>

      <pre>
        <code>{snippet}</code>
      </pre>

      <div className="embed-foot">
        <button type="button" className="hp-cta" onClick={copy}>
          {copied ? (
            <>
              <Check size={13} strokeWidth={2} aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} strokeWidth={1.75} aria-hidden="true" />
              Copy embed code
            </>
          )}
        </button>
        <p>
          Deep-link a stall with <code>?stall=1C-12</code>. The frame posts{" "}
          <code>selection</code>, <code>hold-created</code> and{" "}
          <code>height</code> messages to the host page via{" "}
          <code>postMessage</code>.
        </p>
      </div>
    </section>
  );
}
