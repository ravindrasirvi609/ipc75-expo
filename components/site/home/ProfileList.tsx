import Reveal from "@/components/motion/Reveal";
import SplitLines from "@/components/motion/SplitLines";

type ProfileListProps = {
  id: string;
  eyebrow: string;
  title: string;
  lede: string;
  items: readonly string[];
  /** `gold` for exhibitors, `green` for visitors. */
  tone: "gold" | "green";
  /** Paper or ice ground, so the two lists don't read as one long block. */
  ground: "sheet" | "ice";
};

/**
 * One of the brochure's two profile columns.
 *
 * The items are a set, not a sequence, so they carry no 01/02/03 markers — the
 * total is stated once in the eyebrow, where the count is actually useful, and
 * each row gets a hairline and nothing else.
 */
export default function ProfileList({
  id,
  eyebrow,
  title,
  lede,
  items,
  tone,
  ground,
}: ProfileListProps) {
  return (
    <section className={`band band-${ground} profile profile-${tone}`} id={id}>
      <div className="shell">
        <div className="profile-head">
          <div>
            <p className="eyebrow">
              {eyebrow} · {items.length} categories
            </p>
            <SplitLines as="h2" className="display-l">
              {title}
            </SplitLines>
          </div>
          <p className="lede">{lede}</p>
        </div>

        <Reveal as="ul" className="profile-list" stagger={0.035} distance={16}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
