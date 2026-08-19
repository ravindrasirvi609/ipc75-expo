"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./sections.module.css";

const HIGHLIGHTS = [
  {
    label: "Keynotes",
    title: "Plenary Sessions",
    body: "Leading voices in pharmaceutical research and public health open each day of the congress.",
  },
  {
    label: "Workshops",
    title: "Hands-on Tracks",
    body: "Applied sessions on regulatory science, formulation, and clinical research methods.",
  },
  {
    label: "Posters",
    title: "Research Showcase",
    body: "Emerging research presented by students and early-career scientists from across India.",
  },
];

export function ProgramTeaser() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { stagger: 0.15 });

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>Program</p>
        <h2 className={`${styles.heading} ${styles.reveal}`}>
          Three days of sessions, across every corner of pharmaceutical
          science.
        </h2>
        <div className={styles.grid}>
          {HIGHLIGHTS.map((item) => (
            <article key={item.title} className={`${styles.card} ${styles.reveal}`}>
              <p className={styles.cardLabel}>{item.label}</p>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardBody}>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
