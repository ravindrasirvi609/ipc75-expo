import { ViewTransition } from "react";
import { Hero } from "@/components/Hero/Hero";
import { DiscoverSection } from "@/components/Home/DiscoverSection";
import { ProgramTeaser } from "@/components/Home/ProgramTeaser";
import { SponsorsTeaser } from "@/components/Home/SponsorsTeaser";
import { ROOM_VIEW_TRANSITION } from "@/components/animations/pageTransitions";

export default function Home() {
  return (
    <ViewTransition {...ROOM_VIEW_TRANSITION}>
      <main>
        <Hero />
        <DiscoverSection />
        <ProgramTeaser />
        <SponsorsTeaser />
      </main>
    </ViewTransition>
  );
}
