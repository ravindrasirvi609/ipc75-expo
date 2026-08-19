"use client";

import { useRef } from "react";
import { KineticText } from "@/components/animations/KineticText";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import sectionStyles from "./sections.module.css";
import styles from "./IndiaStory.module.css";

interface IndiaStoryProps {
  className?: string;
}

export function IndiaStory({ className }: IndiaStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${sectionStyles.reveal}`, { stagger: 0.12 });

  return (
    <section
      id="india-journey"
      ref={sectionRef}
      className={`${sectionStyles.section}${className ? ` ${className}` : ""}`}
    >
      <div className={sectionStyles.inner}>
        <p className={`${sectionStyles.eyebrow} ${sectionStyles.reveal}`}>The India Story</p>
        <KineticText
          as="h2"
          text="From dependence to global influence."
          splitBy="words"
          trigger="scroll"
          className={styles.headline}
        />
        <div className={`${styles.copyBlock} ${sectionStyles.reveal}`}>
          <p className={styles.copy}>India&apos;s pharmaceutical journey is a story of transformation.</p>
          <p className={styles.copy}>
            Over generations, the country built scientific capabilities,
            manufacturing strength, research ecosystems and global
            partnerships that helped establish its position as the Pharmacy
            of the World.
          </p>
          <p className={styles.copy}>Now, a new ambition is emerging.</p>
        </div>

        <p className={`${styles.statement} ${sectionStyles.reveal}`}>
          <span className={styles.statementPart}>PHARMACY OF THE WORLD</span>
          <span className={styles.visuallyHidden}>to</span>
          <span className={styles.statementArrow} aria-hidden="true">
            &rarr;
          </span>
          <span className={styles.statementPart}>PHARMA POWERHOUSE</span>
        </p>

        <p className={`${styles.supporting} ${sectionStyles.reveal}`}>
          The next chapter calls for deeper innovation, stronger research,
          advanced manufacturing, global collaboration and a new generation
          of pharmaceutical leaders.
        </p>
      </div>
    </section>
  );
}
