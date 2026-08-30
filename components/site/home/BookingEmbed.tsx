"use client";

import { useEffect, useRef, useState } from "react";

const EMBED_ORIGIN = "https://operant-expo.vercel.app";

export default function BookingEmbed() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(480);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.origin !== EMBED_ORIGIN ||
        event.source !== iframeRef.current?.contentWindow ||
        event.data?.type !== "operant-embed-resize"
      ) {
        return;
      }

      const nextHeight = Number(event.data.height);
      if (Number.isFinite(nextHeight) && nextHeight >= 480) {
        setHeight(nextHeight);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      id="operant-embed-apti-expo"
      src={`${EMBED_ORIGIN}/embed/apti-expo`}
      title="Book a stall — Apticon"
      className="booking-embed"
      style={{ height }}
      loading="lazy"
    />
  );
}
