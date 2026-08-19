"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./sections.module.css";

const CATEGORIES = [
  "Pharmaceutical Manufacturers",
  "Research Institutions",
  "Regulatory Bodies",
  "Academic Partners",
  "Healthcare Technology",
];

export function SponsorsTeaser() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { y: 20, stagger: 0.08 });

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>Exhibitors &amp; Partners</p>
        <h2 className={`${styles.heading} ${styles.reveal}`}>
          Presented alongside the institutions shaping Indian pharma.
        </h2>
        <div className={`${styles.strip} ${styles.reveal}`}>
          {CATEGORIES.map((category) => (
            <span key={category} className={styles.stripItem}>
              {category}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
