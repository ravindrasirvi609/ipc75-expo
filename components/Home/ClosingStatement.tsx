"use client";

import { useRef } from "react";
import { KineticText } from "@/components/animations/KineticText";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./ClosingStatement.module.css";

const LINES = ["Honour the past.", "Celebrate the present.", "Build the future."];

export function ClosingStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { y: 16, stagger: 0.1 });

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.lines}>
          {LINES.map((line, index) => (
            <KineticText
              key={line}
              as="p"
              text={line}
              splitBy="words"
              trigger="scroll"
              delay={index * 0.2}
              className={styles.line}
            />
          ))}
        </div>
        <KineticText
          as="p"
          text="Pharma @2047"
          splitBy="chars"
          trigger="scroll"
          delay={LINES.length * 0.2}
          className={styles.mark}
        />
        <p className={`${styles.footer} ${styles.reveal}`}>
          75th Indian Pharmaceutical Congress · Platinum Jubilee · New Delhi ·
          2026
        </p>
      </div>
    </section>
  );
}
