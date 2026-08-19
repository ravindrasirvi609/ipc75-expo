"use client";

import { useRef } from "react";
import { KineticText } from "@/components/animations/KineticText";
import { MagneticButton } from "@/components/MagneticButton/MagneticButton";
import { RoomLink } from "@/components/RoomTransition/RoomLink";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./FinalCTA.module.css";

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { stagger: 0.15 });

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>The Next Chapter Begins Here</p>
        <KineticText
          as="h2"
          text="From 75 years to 2047."
          splitBy="chars"
          trigger="scroll"
          className={styles.heading}
        />
        <p className={`${styles.body} ${styles.reveal}`}>
          Be part of the journey as India&rsquo;s pharmaceutical ecosystem
          celebrates its legacy, showcases its present and imagines its
          future.
        </p>
        <div className={`${styles.actions} ${styles.reveal}`}>
          <MagneticButton>
            <RoomLink href="/register" direction="forward" className={styles.primaryCta}>
              Join the 75th IPC
            </RoomLink>
          </MagneticButton>
          <a href="#exhibition" className={styles.secondaryCta}>
            Explore the Exhibition
          </a>
        </div>
      </div>
    </section>
  );
}
