"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { EMAILS, EVENT } from "@/lib/expo-content";
import "./globals.css";

/**
 * Catches errors thrown by the root layout itself, so it must supply its own
 * <html>/<body> — this replaces the layout, it doesn't render inside it. No
 * metadata export here (not supported in global-error); site.css isn't
 * imported either, since the failure that lands here may be in a module
 * that css depends on, so this stays deliberately minimal and inline-styled.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          alignItems: "center",
          background: "#0a1a3a",
          color: "#eaf0fa",
          fontFamily:
            '"Inter", "Segoe UI", system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "0 24px" }}>
          <AlertTriangle
            size={32}
            strokeWidth={1.5}
            style={{ color: "#c9a227", margin: "0 auto 20px" }}
          />
          <p
            style={{
              fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#c9a227",
              margin: "0 0 14px",
            }}
          >
            Something went wrong
          </p>
          <h1 style={{ fontSize: 32, lineHeight: 1.1, margin: "0 0 14px" }}>
            This page hit a snag.
          </h1>
          <p style={{ color: "#a9bcd8", lineHeight: 1.6, margin: "0 0 28px" }}>
            Nothing you did caused this, and nothing was lost. Try again, or
            email {EMAILS[0]} if it keeps happening
            {error.digest ? ` (reference ${error.digest})` : ""}.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={retry}
              style={{
                padding: "15px 22px",
                border: "none",
                borderRadius: 2,
                background: "#e4761b",
                color: "#150c04",
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                padding: "15px 22px",
                border: "1px solid #ffffff3d",
                borderRadius: 2,
                color: "#eaf0fa",
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Back to {EVENT.shortName}
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
