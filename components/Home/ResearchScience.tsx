"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./sections.module.css";

const KEYWORDS = [
  "Research",
  "Discovery",
  "Evidence",
  "Experimentation",
  "Translation",
  "Impact",
];

type ResearchScienceProps = {
  className?: string;
};

export function ResearchScience({ className }: ResearchScienceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { stagger: 0.12 });

  const sectionClassName = className ? `${styles.section} ${className}` : styles.section;

  return (
    <section ref={sectionRef} className={sectionClassName}>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>Research &amp; Science</p>
        <h2 className={`${styles.heading} ${styles.reveal}`}>
          WHERE QUESTIONS BECOME DISCOVERIES
        </h2>
        <p className={`${styles.body} ${styles.reveal}`}>
          Research is the engine behind pharmaceutical progress. The exhibition
          celebrates the researchers, institutions and scientific communities
          exploring the questions that could define the next generation of
          healthcare.
        </p>
        <div className={`${styles.strip} ${styles.reveal}`}>
          {KEYWORDS.map((word) => (
            <span key={word} className={styles.stripItem}>
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
