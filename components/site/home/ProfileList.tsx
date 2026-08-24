import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SplitLines from "@/components/motion/SplitLines";
import type { Backdrop as BackdropData } from "@/lib/media";

type ProfileListProps = {
  id: string;
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  lede: string;
  items: readonly string[];
  /** `gold` for exhibitors, `green` for visitors. */
  tone: "gold" | "green";
  backdrop: BackdropData | null;
};

/**
 * One of the brochure's two profile cards — exhibitor or visitor.
 *
 * The items are a set, not a sequence, so they carry no 01/02/03 markers — the
 * total is stated once in the eyebrow, where the count is actually useful, and
 * each row gets a hairline and nothing else.
 */
export default function ProfileList({
  id,
  eyebrow,
  icon: Icon,
  title,
  lede,
  items,
  tone,
  backdrop,
}: ProfileListProps) {
  return (
    <article className={`profile-card profile-${tone}`} id={id}>
      {backdrop?.image ? (
        <div className="profile-card-media">
          <Image
            src={backdrop.image}
            alt=""
            fill
            sizes="(max-width: 860px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : null}

      <div className="profile-card-body">
        <p className="eyebrow">
          <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
          {eyebrow} · {items.length} categories
        </p>
        <SplitLines as="h3" className="display-m profile-card-title">
          {title}
        </SplitLines>
        <p className="lede profile-card-lede">{lede}</p>

        <Reveal as="ul" className="profile-list" stagger={0.02} distance={10}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Reveal>
      </div>
    </article>
  );
}
