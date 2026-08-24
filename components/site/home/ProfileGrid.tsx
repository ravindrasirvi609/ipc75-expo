import { Factory, LayoutGrid, Users } from "lucide-react";
import SplitLines from "@/components/motion/SplitLines";
import ProfileList from "./ProfileList";
import type { Backdrop as BackdropData } from "@/lib/media";
import { EXHIBITOR_PROFILE, VISITOR_PROFILE } from "@/lib/expo-content";

/**
 * Exhibitor and visitor profiles side by side, one card each — the two halves
 * of who is actually on this floor.
 */
export default function ProfileGrid({
  exhibitorBackdrop,
  visitorBackdrop,
}: {
  exhibitorBackdrop: BackdropData | null;
  visitorBackdrop: BackdropData | null;
}) {
  return (
    <section className="band band-sheet profiles">
      <div className="shell">
        <div className="profiles-head">
          <p className="eyebrow">
            <LayoutGrid size={13} strokeWidth={1.75} aria-hidden="true" />
            On the floor
          </p>
          <SplitLines as="h2" className="display-l profiles-title">
            Two sides of the same hall.
          </SplitLines>
          <p className="lede">
            {EXHIBITOR_PROFILE.length} categories exhibit. {VISITOR_PROFILE.length}{" "}
            specify, approve and buy. Hall 1C is where they meet.
          </p>
        </div>

        <div className="profile-grid">
          <ProfileList
            id="exhibitors"
            eyebrow="Exhibitor profile"
            icon={Factory}
            title="What belongs on this floor."
            lede="If you build, supply or service any part of the powder-to-tablet chain, this is your hall."
            items={EXHIBITOR_PROFILE}
            tone="gold"
            backdrop={exhibitorBackdrop}
          />

          <ProfileList
            id="visitors"
            eyebrow="Visitor profile"
            icon={Users}
            title="Who walks it."
            lede="The people who specify, approve and buy process equipment — across formulations, APIs, nutraceuticals, AYUSH, veterinary, cosmetics and food."
            items={VISITOR_PROFILE}
            tone="green"
            backdrop={visitorBackdrop}
          />
        </div>
      </div>
    </section>
  );
}
