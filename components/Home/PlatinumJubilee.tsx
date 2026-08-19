"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import { KineticText } from "@/components/animations/KineticText";
import sectionStyles from "./sections.module.css";
import styles from "./PlatinumJubilee.module.css";

export interface PlatinumJubileeProps {
  className?: string;
}

export function PlatinumJubilee({ className }: PlatinumJubileeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${sectionStyles.reveal}`, { stagger: 0.15 });

  return (
    <section
      ref={sectionRef}
      className={className ? `${sectionStyles.section} ${className}` : sectionStyles.section}
    >
      <div className={sectionStyles.inner}>
        <p className={`${sectionStyles.eyebrow} ${sectionStyles.reveal}`}>
          Platinum Jubilee &middot; 75 Years
        </p>
        <KineticText
          as="h2"
          text="75 years. Countless discoveries. One continuing journey."
          splitBy="words"
          trigger="scroll"
          className={`${sectionStyles.heading} ${styles.headline}`}
        />
        <p className={`${sectionStyles.body} ${sectionStyles.reveal}`}>
          The 75th IPC marks a landmark moment for the Indian pharmaceutical
          community.
        </p>
        <p className={`${sectionStyles.body} ${sectionStyles.reveal}`}>
          It is a celebration of seven and a half decades of professional
          excellence, scientific progress, education, research, innovation
          and collaboration.
        </p>
        <p className={`${sectionStyles.body} ${sectionStyles.reveal}`}>
          But this milestone is more than a look back. It is a launchpad for
          the future.
        </p>
        <div className={`${styles.highlight} ${sectionStyles.reveal}`} aria-label="1948 to 2026 to 2047">
          <span className={styles.year}>1948</span>
          <span className={styles.arrow} aria-hidden="true">&rarr;</span>
          <span className={styles.year}>2026</span>
          <span className={styles.arrow} aria-hidden="true">&rarr;</span>
          <span className={styles.year}>2047</span>
        </div>
        <p className={`${styles.supportLine} ${sectionStyles.reveal}`}>
          Honour the past. Experience the present. Shape the future.
        </p>
      </div>
    </section>
  );
}
