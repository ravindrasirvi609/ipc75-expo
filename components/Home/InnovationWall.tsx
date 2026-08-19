"use client";

import { useId, useRef, useState } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import sectionStyles from "./sections.module.css";
import styles from "./InnovationWall.module.css";

const ITEMS: string[] = [
  "AI-POWERED DRUG DISCOVERY",
  "SMART PHARMACEUTICAL MANUFACTURING",
  "NEXT-GENERATION BIOTECHNOLOGY",
  "PRECISION THERAPEUTICS",
  "DIGITAL HEALTH",
  "ADVANCED DRUG DELIVERY",
  "GENOMICS",
  "SUSTAINABLE PHARMA",
  "NEXT-GENERATION FORMULATION",
];

function twoDigit(n: number) {
  return String(n).padStart(2, "0");
}

export interface InnovationWallProps {
  className?: string;
}

/**
 * "The Innovation Wall" — 9 disclosure cards. Only a title is given for
 * each item, so the expand interaction reveals no invented body copy;
 * instead it's a purposeful "detail" moment built entirely from data
 * already on the card — its index and its own title, restyled larger
 * with an animated accent rule.
 */
export function InnovationWall({ className }: InnovationWallProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const idPrefix = useId();

  useScrollReveal(sectionRef, `.${sectionStyles.reveal}`, { stagger: 0.08 });

  const toggle = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section
      id="innovation"
      ref={sectionRef}
      className={className ? `${sectionStyles.section} ${className}` : sectionStyles.section}
    >
      <div className={sectionStyles.inner}>
        <p className={`${sectionStyles.eyebrow} ${sectionStyles.reveal}`}>Innovation</p>
        <h2 className={`${sectionStyles.heading} ${sectionStyles.reveal}`}>
          The Innovation Wall
        </h2>
        <p className={`${sectionStyles.body} ${sectionStyles.reveal}`}>
          Ideas become breakthroughs when science meets imagination.
        </p>

        <div className={styles.wall}>
          {ITEMS.map((title, i) => {
            const isExpanded = expanded.has(i);
            const triggerId = `${idPrefix}-trigger-${i}`;
            const panelId = `${idPrefix}-panel-${i}`;
            const index = twoDigit(i + 1);

            return (
              <article
                key={title}
                className={`${styles.card} ${sectionStyles.reveal}`}
                data-expanded={isExpanded}
              >
                <button
                  type="button"
                  id={triggerId}
                  className={styles.trigger}
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                >
                  <span className={styles.triggerText}>
                    <span className={styles.triggerIndex} aria-hidden="true">
                      {index}
                    </span>
                    <span className={styles.triggerTitle}>{title}</span>
                  </span>
                  <span className={styles.triggerIcon} aria-hidden="true" />
                </button>

                <div className={styles.panelWrap}>
                  <div
                    id={panelId}
                    className={styles.panelInner}
                    role="region"
                    aria-labelledby={triggerId}
                    aria-hidden={!isExpanded}
                  >
                    <div className={styles.panel}>
                      <div className={styles.panelRule} />
                      <div className={styles.panelDetail}>
                        <span className={styles.panelIndex}>{index}</span>
                        <span className={styles.panelEcho}>{title}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
