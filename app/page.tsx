import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import Hero from "@/components/site/home/Hero";
import WhyExhibit from "@/components/site/home/WhyExhibit";
import ProfileGrid from "@/components/site/home/ProfileGrid";
import Gallery from "@/components/site/home/Gallery";
import ChargesBand from "@/components/site/home/ChargesBand";
import VenueBand from "@/components/site/home/VenueBand";
import BookingEmbed from "@/components/site/home/BookingEmbed";
import { EVENT, VENUE } from "@/lib/expo-content";
import { STALLS } from "@/lib/hall-1c-plan";
import { getPublicStatesSafely } from "@/lib/stall-bookings";
import { resolveBackdrop } from "@/lib/media";
import "@/components/site/site.css";
import "@/components/site/home/home.css";

/**
 * Availability is read from disk, which Next cannot see as dynamic — without
 * this the page would be prerendered once and show a frozen stall count. Sixty
 * seconds is plenty: the interactive plan polls the API for live numbers itself.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${EVENT.name} — ${EVENT.parent}`,
  description: `${EVENT.subtitle}. ${EVENT.dates.label}, ${VENUE.name}, ${VENUE.city}. Book exhibition space in ${VENUE.hall}.`,
};

export default async function Home() {
  const availability = await getPublicStatesSafely();
  const taken = availability.stalls.map((entry) => entry.id);
  const available = availability.unavailable
    ? null
    : STALLS.length - taken.length;

  return (
    <>
      <SiteHeader />
      <main>
        <Hero
          taken={taken}
          unavailable={availability.unavailable}
          backdrop={resolveBackdrop("hero")}
        />
        <WhyExhibit />

        <ProfileGrid
          exhibitorBackdrop={resolveBackdrop("exhibitors")}
          visitorBackdrop={resolveBackdrop("visitors")}
        />

        <Gallery />

        <ChargesBand available={available} backdrop={resolveBackdrop("charges")} />
        <VenueBand backdrop={resolveBackdrop("venue")} />
        <section className="band booking-band" id="book">
          <div className="shell">
            <BookingEmbed />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
