"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./sections.module.css";

type WomenInPharmacyProps = {
  className?: string;
};

export function WomenInPharmacy({ className }: WomenInPharmacyProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { stagger: 0.15 });

  const sectionClassName = className ? `${styles.section} ${className}` : styles.section;

  return (
    <section ref={sectionRef} className={sectionClassName}>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>Women in Pharmacy</p>
        <h2 className={`${styles.heading} ${styles.reveal}`}>
          Leadership has no single shape.
        </h2>
        <p
          className={`${styles.body} ${styles.reveal}`}
          style={{ maxWidth: "46rem", fontSize: "1.15rem" }}
        >
          Across research, education, industry, healthcare and entrepreneurship,
          women continue to shape the future of pharmacy. Celebrate the voices,
          achievements and perspectives contributing to the next chapter of the
          profession.
        </p>
      </div>
    </section>
  );
}
