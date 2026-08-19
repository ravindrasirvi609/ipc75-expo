"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./sections.module.css";

export interface ProgramTeaserProps {
  className?: string;
}

const PILLARS = [
  {
    label: "Showcase",
    title: "SHOWCASE",
    body: "Present technologies, products and capabilities.",
  },
  {
    label: "Connect",
    title: "CONNECT",
    body: "Build meaningful professional relationships.",
  },
  {
    label: "Collaborate",
    title: "COLLABORATE",
    body: "Turn conversations into partnerships.",
  },
];

export function ProgramTeaser({ className }: ProgramTeaserProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { stagger: 0.15 });

  return (
    <section
      ref={sectionRef}
      className={className ? `${styles.section} ${className}` : styles.section}
    >
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>Industry &amp; Innovation</p>
        <h2 className={`${styles.heading} ${styles.reveal}`}>Where industry meets ideas.</h2>
        <p className={`${styles.body} ${styles.reveal}`}>
          The exhibition creates a space where pharmaceutical companies,
          technology innovators, researchers, institutions and emerging
          entrepreneurs come together to explore new opportunities.
        </p>
        <div className={styles.grid}>
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className={`${styles.card} ${styles.reveal}`}>
              <p className={styles.cardLabel}>{pillar.label}</p>
              <h3 className={styles.cardTitle}>{pillar.title}</h3>
              <p className={styles.cardBody}>{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
