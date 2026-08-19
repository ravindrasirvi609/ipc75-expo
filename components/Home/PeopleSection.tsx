"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import { KineticText } from "@/components/animations/KineticText";
import sectionStyles from "./sections.module.css";
import styles from "./PeopleSection.module.css";

export interface PeopleSectionProps {
  className?: string;
}

const ROLES = [
  "Scientists",
  "Researchers",
  "Pharmacists",
  "Educators",
  "Entrepreneurs",
  "Engineers",
  "Healthcare professionals",
  "Students",
  "Policy leaders",
];

// Purely decorative placeholders standing in for portrait imagery. No real
// photos or named individuals exist for this brief, so each tile is an
// abstract gradient shape — the variant only changes its silhouette
// (rounded square / circle / square), never implying a likeness.
const PORTRAIT_VARIANTS = [0, 1, 2, 0, 1, 2];

export function PeopleSection({ className }: PeopleSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${sectionStyles.reveal}`, { stagger: 0.1 });

  return (
    <section
      id="people"
      ref={sectionRef}
      className={className ? `${sectionStyles.section} ${className}` : sectionStyles.section}
    >
      <div className={sectionStyles.inner}>
        <p className={`${sectionStyles.eyebrow} ${sectionStyles.reveal}`}>People</p>
        <h2 className={`${sectionStyles.heading} ${sectionStyles.reveal}`}>
          The people who move pharma forward.
        </h2>
        <p className={`${sectionStyles.body} ${sectionStyles.reveal}`}>
          Every breakthrough begins with people.
        </p>

        <ul className={`${styles.rolesWall} ${sectionStyles.reveal}`}>
          {ROLES.map((role) => (
            <li key={role} className={styles.roleChip}>
              {role}
            </li>
          ))}
        </ul>

        <div className={`${styles.portraitRow} ${sectionStyles.reveal}`} aria-hidden="true">
          {PORTRAIT_VARIANTS.map((variant, index) => (
            <div key={index} className={styles.portraitTile} data-variant={variant} />
          ))}
        </div>

        <KineticText
          as="p"
          text="Different disciplines. One ecosystem. One future."
          splitBy="words"
          trigger="scroll"
          className={styles.statement}
        />
      </div>
    </section>
  );
}
