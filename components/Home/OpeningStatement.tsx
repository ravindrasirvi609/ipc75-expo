"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import sectionStyles from "./sections.module.css";
import styles from "./OpeningStatement.module.css";

export interface OpeningStatementProps {
  className?: string;
}

export function OpeningStatement({ className }: OpeningStatementProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${sectionStyles.reveal}`, { stagger: 0.15 });

  return (
    <section
      ref={sectionRef}
      className={className ? `${sectionStyles.section} ${className}` : sectionStyles.section}
    >
      <div className={sectionStyles.inner}>
        <p className={`${sectionStyles.eyebrow} ${sectionStyles.reveal}`}>75 Years</p>
        <h2 className={`${sectionStyles.heading} ${sectionStyles.reveal}`}>
          A journey 75 years in the making.
        </h2>
        <p className={`${sectionStyles.body} ${sectionStyles.reveal}`}>
          For seventy-five years, Indian pharmacy has evolved through
          scientific ambition, industrial resilience, research,
          entrepreneurship and a commitment to accessible healthcare.
        </p>
        <p className={`${sectionStyles.body} ${sectionStyles.reveal}`}>
          The 75th Indian Pharmaceutical Congress brings this journey into
          focus &mdash; celebrating the people, ideas and innovations that
          transformed India&rsquo;s pharmaceutical landscape while looking
          ahead to the next horizon.
        </p>
        <p className={`${styles.statement} ${sectionStyles.reveal}`}>
          The next chapter is not simply about where pharmacy has been. It is
          about where India can take it next.
        </p>
      </div>
    </section>
  );
}
