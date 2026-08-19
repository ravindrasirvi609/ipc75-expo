"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/animation/gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import sectionStyles from "./sections.module.css";
import styles from "./InteractiveTimeline.module.css";

type Milestone = {
  year: string;
  text: string;
  emphasis?: boolean;
};

const MILESTONES: Milestone[] = [
  { year: "1947", text: "Foundations of modern Indian pharmacy." },
  {
    year: "1948",
    text: "The Indian Pharmaceutical Congress begins its continuing journey.",
  },
  {
    year: "The Decades",
    text: "Education expands. Research grows. Industry evolves. Manufacturing scales.",
  },
  {
    year: "The Global Era",
    text: "India strengthens its role in global pharmaceutical supply and healthcare.",
  },
  {
    year: "2026",
    text: "75th Indian Pharmaceutical Congress. Platinum Jubilee.",
    emphasis: true,
  },
  {
    year: "2047",
    text: "PHARMA POWERHOUSE. The next ambition.",
    emphasis: true,
  },
];

type InteractiveTimelineProps = {
  className?: string;
};

export function InteractiveTimeline({ className }: InteractiveTimelineProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);

  // A fixed, known-length set of milestones — six fixed refs (rather than a
  // ref created inside `.map`) so each moment gets its own independent
  // useScrollReveal trigger and reveals as the reader scrolls past it,
  // instead of the whole list bursting in together.
  const item0Ref = useRef<HTMLLIElement>(null);
  const item1Ref = useRef<HTMLLIElement>(null);
  const item2Ref = useRef<HTMLLIElement>(null);
  const item3Ref = useRef<HTMLLIElement>(null);
  const item4Ref = useRef<HTMLLIElement>(null);
  const item5Ref = useRef<HTMLLIElement>(null);
  const itemRefs = [item0Ref, item1Ref, item2Ref, item3Ref, item4Ref, item5Ref];

  const reducedMotion = useReducedMotion();

  useScrollReveal(headerRef, `.${sectionStyles.reveal}`);
  useScrollReveal(item0Ref, `.${sectionStyles.reveal}`, { y: 24, stagger: 0.08 });
  useScrollReveal(item1Ref, `.${sectionStyles.reveal}`, { y: 24, stagger: 0.08 });
  useScrollReveal(item2Ref, `.${sectionStyles.reveal}`, { y: 24, stagger: 0.08 });
  useScrollReveal(item3Ref, `.${sectionStyles.reveal}`, { y: 24, stagger: 0.08 });
  useScrollReveal(item4Ref, `.${sectionStyles.reveal}`, { y: 24, stagger: 0.08 });
  useScrollReveal(item5Ref, `.${sectionStyles.reveal}`, { y: 24, stagger: 0.08 });

  // The connecting line "draws" itself in sync with scroll progress through
  // the track — a lightweight scroll-linked touch (transform-only) on top of
  // the per-milestone reveals above, so the timeline reads as a journey
  // rather than a static rule with dots on it.
  useEffect(() => {
    const fill = lineFillRef.current;
    if (!fill) return;

    if (reducedMotion) {
      gsap.set(fill, { scaleY: 1 });
      return;
    }

    const track = trackRef.current;
    if (!track) return;

    registerGsap();
    gsap.set(fill, { scaleY: 0 });

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top 75%",
      end: "bottom 75%",
      onUpdate: (self) => {
        gsap.set(fill, { scaleY: self.progress });
      },
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  const rootClassName = className
    ? `${sectionStyles.section} ${className}`
    : sectionStyles.section;

  return (
    <section className={rootClassName}>
      <div className={sectionStyles.inner}>
        <div ref={headerRef}>
          <p className={`${sectionStyles.eyebrow} ${sectionStyles.reveal}`}>1947 — 2047</p>
          <h2 className={`${sectionStyles.heading} ${sectionStyles.reveal}`}>
            75 YEARS OF MOVEMENT
          </h2>
        </div>
        <div className={styles.track} ref={trackRef}>
          <div className={styles.lineBase} aria-hidden="true" />
          <div className={styles.lineFill} ref={lineFillRef} aria-hidden="true" />
          <ol className={styles.list}>
            {MILESTONES.map((milestone, index) => (
              <li
                key={milestone.year}
                ref={itemRefs[index]}
                className={
                  milestone.emphasis
                    ? `${styles.item} ${styles.itemEmphasis}`
                    : styles.item
                }
              >
                <span className={`${styles.dot} ${sectionStyles.reveal}`} aria-hidden="true" />
                <span className={`${styles.year} ${sectionStyles.reveal}`}>
                  {milestone.year}
                </span>
                <p className={`${styles.text} ${sectionStyles.reveal}`}>{milestone.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
