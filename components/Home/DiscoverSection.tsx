"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./sections.module.css";

const PHILOSOPHY = [
  {
    word: "Discover",
    line: "Explore technologies changing pharmaceutical science.",
  },
  {
    word: "Connect",
    line: "Meet the people and organizations driving transformation.",
  },
  {
    word: "Imagine",
    line: "See what India’s pharmaceutical future could become.",
  },
];

export interface DiscoverSectionProps {
  className?: string;
}

export function DiscoverSection({ className }: DiscoverSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { stagger: 0.15 });

  return (
    <section
      ref={sectionRef}
      className={className ? `${styles.section} ${className}` : styles.section}
    >
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>The Exhibition Philosophy</p>
        <h2 className={`${styles.heading} ${styles.reveal}`}>
          Where pharmacy meets possibility.
        </h2>
        <p className={`${styles.body} ${styles.reveal}`}>
          The exhibition brings together the technologies, ideas and
          industries redefining pharmaceutical science and healthcare.
        </p>
        <p className={`${styles.body} ${styles.reveal}`}>
          From advanced manufacturing to intelligent drug discovery, from
          biotechnology to precision medicine, the exhibition is designed as a
          window into the next generation of pharmaceutical innovation.
        </p>
        <div className={styles.grid}>
          {PHILOSOPHY.map((item) => (
            <article key={item.word} className={`${styles.card} ${styles.reveal}`}>
              <h3 className={styles.heading}>{item.word}</h3>
              <p className={styles.cardBody}>{item.line}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
