import type { Metadata } from "next";
import { Share2 } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import SplitLines from "@/components/motion/SplitLines";
import { EVENT, VENUE } from "@/lib/expo-content";
import ShareClient from "./ShareClient";
import "@/components/site/site.css";
import "../exhibit/exhibit.css";
import "./share.css";

export const metadata: Metadata = {
  title: `Share your attendance — ${EVENT.parent}`,
  description: `Generate a ready-to-share 1080 × 1080 social post for the ${EVENT.parent} at ${VENUE.name}, ${VENUE.city}. Upload your photo and download instantly.`,
  /*
   * Utility page — keep it out of public search results so it does not
   * dilute the main site's canonical pages.
   */
  robots: { index: false },
};

export default function SharePage() {
  return (
    <>
      <SiteHeader solid />
      <main className="head-offset">
        {/* ── Page lead: matches the band-deep header pattern on /contact and /exhibit ── */}
        <section className="band band-deep page-lead">
          <div className="shell">
            <p className="eyebrow">
              <Share2 size={13} strokeWidth={1.75} aria-hidden="true" />
              Share your attendance
            </p>
            <SplitLines as="h1" className="display-xl page-title" onLoad delay={0.1}>
              Tell your network you&rsquo;re coming.
            </SplitLines>
            <p className="lede page-lede">
              Upload your photo and name — we&rsquo;ll generate a
              ready-to-share 1080 × 1080 social post for the{" "}
              <strong>{EVENT.parent}</strong>.
            </p>
          </div>
        </section>

        {/* ── Interactive generator — all canvas logic lives in ShareClient ── */}
        <section className="band band-sheet share-section">
          <div className="shell">
            <ShareClient />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
