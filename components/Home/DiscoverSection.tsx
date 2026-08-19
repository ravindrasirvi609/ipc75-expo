"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./sections.module.css";

export function DiscoverSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>Discover</p>
        <h2 className={`${styles.heading} ${styles.reveal}`}>
          Seventy-five years of pharmaceutical science, gathered under one
          roof.
        </h2>
        <p className={`${styles.body} ${styles.reveal}`}>
          Since 1949, the Indian Pharmaceutical Congress has brought together
          researchers, educators, regulators, and industry leaders shaping the
          science of medicine in India. This milestone edition is presented as
          a digital exhibition — walk through the program, the people, and the
          history at your own pace.
        </p>
      </div>
    </section>
  );
}
