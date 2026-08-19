"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import { MagneticButton } from "@/components/MagneticButton/MagneticButton";
import sectionStyles from "./sections.module.css";
import styles from "./PharmaExpo.module.css";

export interface PharmaExpoProps {
  className?: string;
}

export function PharmaExpo({ className }: PharmaExpoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${sectionStyles.reveal}`, { stagger: 0.12 });

  return (
    <section
      ref={sectionRef}
      className={className ? `${sectionStyles.section} ${className}` : sectionStyles.section}
    >
      <div className={sectionStyles.inner}>
        <p className={`${sectionStyles.eyebrow} ${sectionStyles.reveal}`}>Exhibition</p>
        <h2 className={`${sectionStyles.heading} ${sectionStyles.reveal}`}>PharmaExpo 2026</h2>
        <p className={`${styles.subtitle} ${sectionStyles.reveal}`}>
          Where the pharmaceutical ecosystem comes together.
        </p>
        <p className={`${sectionStyles.body} ${sectionStyles.reveal}`}>
          Discover technologies, solutions and innovations across the
          pharmaceutical value chain. From research and development to
          manufacturing, technology, equipment and healthcare solutions,
          PharmaExpo brings the industry into one connected experience.
        </p>
        <div className={`${styles.ctaWrap} ${sectionStyles.reveal}`}>
          <MagneticButton>
            <a href="#exhibition" className={styles.cta}>
              Explore PharmaExpo
            </a>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
