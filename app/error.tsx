"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { EMAILS, EVENT } from "@/lib/expo-content";
import "./globals.css";
import "@/components/site/site.css";

/**
 * Root-level safety net for anything not already caught with its own
 * graceful fallback (see getPublicStatesSafely). `retry` re-renders this
 * segment without a full navigation — the current stable API as of Next
 * 16.3; older `reset` is a legacy alias.
 */
export default function Error({
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
    <main
      className="band band-deep"
      style={{ minHeight: "100vh", display: "grid", alignItems: "center" }}
    >
      <div className="shell" style={{ maxWidth: 560, textAlign: "center" }}>
        <AlertTriangle
          size={32}
          strokeWidth={1.5}
          style={{ color: "var(--gold)", margin: "0 auto 20px" }}
        />
        <p className="eyebrow" style={{ justifyContent: "center" }}>
          Something went wrong
        </p>
        <h1 className="display-l" style={{ color: "#fff", marginBottom: 14 }}>
          This page hit a snag.
        </h1>
        <p className="lede" style={{ margin: "0 auto 28px" }}>
          Nothing you did caused this, and nothing was lost. Try again, or
          email {EMAILS[0]} if it keeps happening
          {error.digest ? ` (reference ${error.digest})` : ""}.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button type="button" className="btn btn-primary" onClick={retry}>
            Try again
          </button>
          <Link className="btn btn-ghost" href="/">
            Back to {EVENT.shortName}
          </Link>
        </div>
      </div>
    </main>
  );
}
