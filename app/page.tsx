import { ViewTransition } from "react";
import { Hero } from "@/components/Hero/Hero";
import { OpeningStatement } from "@/components/Home/OpeningStatement";
import { PlatinumJubilee } from "@/components/Home/PlatinumJubilee";
import { DiscoverSection } from "@/components/Home/DiscoverSection";
import { FutureZones } from "@/components/Home/FutureZones";
import { IndiaStory } from "@/components/Home/IndiaStory";
import { Pharma2047 } from "@/components/Home/Pharma2047";
import { InnovationWall } from "@/components/Home/InnovationWall";
import { PeopleSection } from "@/components/Home/PeopleSection";
import { ProgramTeaser } from "@/components/Home/ProgramTeaser";
import { PharmaExpo } from "@/components/Home/PharmaExpo";
import { CeoLeadership } from "@/components/Home/CeoLeadership";
import { ResearchScience } from "@/components/Home/ResearchScience";
import { NextGeneration } from "@/components/Home/NextGeneration";
import { WomenInPharmacy } from "@/components/Home/WomenInPharmacy";
import { InteractiveTimeline } from "@/components/Home/InteractiveTimeline";
import { ExhibitionExperience } from "@/components/Home/ExhibitionExperience";
import { Venue } from "@/components/Home/Venue";
import { SponsorsTeaser } from "@/components/Home/SponsorsTeaser";
import { FinalCTA } from "@/components/Home/FinalCTA";
import { ClosingStatement } from "@/components/Home/ClosingStatement";
import { ROOM_VIEW_TRANSITION } from "@/components/animations/pageTransitions";

export default function Home() {
  return (
    <ViewTransition {...ROOM_VIEW_TRANSITION}>
      <main>
        <Hero />
        <OpeningStatement />
        <PlatinumJubilee />
        <DiscoverSection />
        <FutureZones />
        <IndiaStory />
        <Pharma2047 />
        <InnovationWall />
        <PeopleSection />
        <ProgramTeaser />
        <PharmaExpo />
        <CeoLeadership />
        <ResearchScience />
        <NextGeneration />
        <WomenInPharmacy />
        <InteractiveTimeline />
        <ExhibitionExperience />
        <Venue />
        <SponsorsTeaser />
        <FinalCTA />
        <ClosingStatement />
      </main>
    </ViewTransition>
  );
}
