"use client";

import { useRef, useState, type CSSProperties } from "react";
import { KineticText } from "@/components/animations/KineticText";
import { MagneticButton } from "@/components/MagneticButton/MagneticButton";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./sections.module.css";

type NextGenerationProps = {
  className?: string;
};

// The brief calls for a Hero-style pill CTA (gold border, fill-on-hover) but
// this component isn't permitted its own CSS module — so the treatment is
// replicated with inline styles + hover state instead of a stylesheet rule.
const ctaBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  border: "1px solid var(--accent)",
  padding: "0.85rem 2.25rem",
  fontSize: "0.85rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  textDecoration: "none",
  transition: "background-color 0.25s ease, color 0.25s ease",
};

export function NextGeneration({ className }: NextGenerationProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [ctaActive, setCtaActive] = useState(false);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { stagger: 0.15 });

  const sectionClassName = className ? `${styles.section} ${className}` : styles.section;

  return (
    <section ref={sectionRef} className={sectionClassName}>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>Next Generation</p>
        <h2 className={`${styles.heading} ${styles.reveal}`}>
          THE NEXT GENERATION IS ALREADY HERE.
        </h2>
        <p className={`${styles.body} ${styles.reveal}`}>
          The future of pharmacy belongs to the students, researchers and young
          professionals who are willing to ask different questions. The 75th IPC
          creates space for emerging voices to learn, connect, experiment and
          imagine new possibilities.
        </p>
        <div
          style={{
            marginTop: "2.5rem",
            fontSize: "clamp(1.75rem, 5vw, 3.25rem)",
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "0.01em",
          }}
        >
          <KineticText
            as="p"
            text="LEARN. QUESTION. CREATE. LEAD."
            splitBy="words"
            trigger="scroll"
          />
        </div>
        <div className={`${styles.reveal}`} style={{ marginTop: "2.5rem" }}>
          <MagneticButton>
            <a
              href="#people"
              onMouseEnter={() => setCtaActive(true)}
              onMouseLeave={() => setCtaActive(false)}
              onFocus={() => setCtaActive(true)}
              onBlur={() => setCtaActive(false)}
              style={{
                ...ctaBaseStyle,
                color: ctaActive ? "var(--surface)" : "var(--accent)",
                backgroundColor: ctaActive ? "var(--accent)" : "transparent",
              }}
            >
              Meet the Next Generation
            </a>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
