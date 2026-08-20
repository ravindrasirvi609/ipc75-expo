import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import Hero from "@/components/site/home/Hero";
import WhyExhibit from "@/components/site/home/WhyExhibit";
import ProfileList from "@/components/site/home/ProfileList";
import ChargesBand from "@/components/site/home/ChargesBand";
import VenueBand from "@/components/site/home/VenueBand";
import {
  EVENT,
  EXHIBITOR_PROFILE,
  VENUE,
  VISITOR_PROFILE,
} from "@/lib/expo-content";
import { STALLS } from "@/lib/hall-1c-plan";
import { getPublicStates } from "@/lib/stall-bookings";
import "@/components/site/site.css";
import "@/components/site/home/home.css";

/**
 * Availability is read from disk, which Next cannot see as dynamic — without
 * this the page would be prerendered once and show a frozen stand count. Sixty
 * seconds is plenty: the interactive plan polls the API for live numbers itself.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: `${EVENT.name} — ${EVENT.parent}`,
  description: `${EVENT.subtitle}. ${EVENT.dates.label}, ${VENUE.name}, ${VENUE.city}. Book exhibition space in ${VENUE.hall}.`,
};

export default async function Home() {
  const availability = await getPublicStates();
  const taken = availability.stalls.map((entry) => entry.id);

  return (
    <>
      <SiteHeader />
      <main>
        <Hero taken={taken} />
        <WhyExhibit />

        <ProfileList
          id="exhibitors"
          eyebrow="Exhibitor profile"
          title="What belongs on this floor."
          lede="If you build, supply or service any part of the powder-to-tablet chain, this is your hall."
          items={EXHIBITOR_PROFILE}
          tone="gold"
          ground="sheet"
        />

        <ProfileList
          id="visitors"
          eyebrow="Visitor profile"
          title="Who walks it."
          lede="The people who specify, approve and buy process equipment — across formulations, APIs, nutraceuticals, AYUSH, veterinary, cosmetics and food."
          items={VISITOR_PROFILE}
          tone="green"
          ground="ice"
        />

        <ChargesBand available={STALLS.length - taken.length} />
        <VenueBand />
      </main>
      <SiteFooter />
    </>
  );
}
