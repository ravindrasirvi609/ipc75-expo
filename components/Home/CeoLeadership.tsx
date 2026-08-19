"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import { KineticText } from "@/components/animations/KineticText";
import sectionStyles from "./sections.module.css";
import styles from "./CeoLeadership.module.css";

export interface CeoLeadershipProps {
  className?: string;
}

const ROLES = [
  "Industry leaders",
  "Entrepreneurs",
  "Scientists",
  "Researchers",
  "Policymakers",
  "Innovators",
];

export function CeoLeadership({ className }: CeoLeadershipProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${sectionStyles.reveal}`, { stagger: 0.15 });

  return (
    <section
      ref={sectionRef}
      className={className ? `${sectionStyles.section} ${className}` : sectionStyles.section}
    >
      <div className={sectionStyles.inner}>
        <p className={`${sectionStyles.eyebrow} ${sectionStyles.reveal}`}>Leadership</p>
        <h2 className={`${sectionStyles.heading} ${sectionStyles.reveal}`}>
          The people shaping the next decade.
        </h2>
        <p className={`${sectionStyles.body} ${sectionStyles.reveal}`}>
          Leadership in pharma is no longer only about scale. It is about
          innovation, resilience, technology, talent and the ability to
          anticipate what healthcare needs next.
        </p>
        <div className={`${sectionStyles.strip} ${sectionStyles.reveal}`}>
          {ROLES.map((role) => (
            <span key={role} className={sectionStyles.stripItem}>
              {role}
            </span>
          ))}
        </div>
        <KineticText
          as="p"
          text="The next pharma powerhouse will be built by people who think beyond today."
          splitBy="words"
          trigger="scroll"
          className={styles.closingStatement}
        />
      </div>
    </section>
  );
}
