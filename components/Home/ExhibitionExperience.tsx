"use client";

import { useRef } from "react";
import { KineticText } from "@/components/animations/KineticText";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./sections.module.css";

const LINES = [
  "Walk through ideas.",
  "Discover technologies.",
  "Meet innovators.",
  "Explore possibilities.",
  "See the future taking shape.",
];

const MODES = [
  {
    label: "Explore",
    title: "EXPLORE",
    body: "Discover exhibition zones and innovations.",
  },
  {
    label: "Engage",
    title: "ENGAGE",
    body: "Interact with people, technologies and ideas.",
  },
  {
    label: "Imagine",
    title: "IMAGINE",
    body: "Look beyond today's possibilities toward Pharma @2047.",
  },
];

export function ExhibitionExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { stagger: 0.15 });

  return (
    <section id="experience" ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>Experience</p>
        <KineticText
          as="h2"
          text="Don't just visit the exhibition. Experience it."
          splitBy="words"
          trigger="scroll"
          className={styles.heading}
        />
        <p className={`${styles.body} ${styles.reveal}`}>
          {LINES.map((line, index) => (
            <span
              key={line}
              style={{
                display: "block",
                marginTop: index === 0 ? 0 : "0.4em",
              }}
            >
              {line}
            </span>
          ))}
        </p>
        <div className={styles.grid}>
          {MODES.map((mode) => (
            <article key={mode.title} className={`${styles.card} ${styles.reveal}`}>
              <p className={styles.cardLabel}>{mode.label}</p>
              <h3 className={styles.cardTitle}>{mode.title}</h3>
              <p className={styles.cardBody}>{mode.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
