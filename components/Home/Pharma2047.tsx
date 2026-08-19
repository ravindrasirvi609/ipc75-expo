"use client";

import { useRef } from "react";
import { KineticText } from "@/components/animations/KineticText";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import sectionStyles from "./sections.module.css";
import styles from "./Pharma2047.module.css";

type Pillar = {
  index: string;
  title: string;
  body: string;
};

const PILLARS: Pillar[] = [
  {
    index: "01",
    title: "Innovation",
    body: "From breakthrough science to transformative technologies.",
  },
  {
    index: "02",
    title: "Intelligence",
    body: "AI-powered discovery, development and decision-making.",
  },
  {
    index: "03",
    title: "Precision",
    body: "More targeted, personalized and data-driven healthcare.",
  },
  {
    index: "04",
    title: "Scale",
    body: "World-class manufacturing and resilient supply chains.",
  },
  {
    index: "05",
    title: "Access",
    body: "Quality healthcare and medicines reaching more people.",
  },
  {
    index: "06",
    title: "Global Leadership",
    body: "India as a creator, innovator and partner in global healthcare.",
  },
];

export interface Pharma2047Props {
  className?: string;
}

/**
 * "Pharma @2047" — one of the biggest sections on the site. Opens with a
 * cinematic scroll-triggered headline, presents the six pillars of the 2047
 * vision as a numbered grid, and closes on a standalone statement moment.
 */
export function Pharma2047({ className }: Pharma2047Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${sectionStyles.reveal}`, { stagger: 0.1 });

  return (
    <section
      id="pharma-2047"
      ref={sectionRef}
      className={className ? `${styles.section} ${className}` : styles.section}
    >
      <div className={styles.inner}>
        <p className={`${sectionStyles.eyebrow} ${sectionStyles.reveal}`}>THE 2047 VISION</p>

        <KineticText
          as="h2"
          text="WHAT WILL PHARMA LOOK LIKE IN 2047?"
          splitBy="words"
          trigger="scroll"
          className={styles.heading}
        />

        <p className={`${styles.intro} ${sectionStyles.reveal}`}>
          A new generation is already building the answer.
        </p>

        <div className={styles.pillars}>
          {PILLARS.map((pillar) => (
            <article
              key={pillar.index}
              className={`${styles.pillar} ${sectionStyles.reveal}`}
            >
              <span className={styles.pillarIndex} aria-hidden="true">
                {pillar.index}
              </span>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarBody}>{pillar.body}</p>
            </article>
          ))}
        </div>

        <div className={styles.closing}>
          <KineticText
            as="p"
            text="2047 IS NOT A DESTINATION. IT IS A DIRECTION."
            splitBy="words"
            trigger="scroll"
            className={styles.closingText}
          />
        </div>
      </div>
    </section>
  );
}
