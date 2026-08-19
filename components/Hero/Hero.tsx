"use client";

import { useEffect, useRef } from "react";
import { MagneticButton } from "@/components/MagneticButton/MagneticButton";
import { KineticText } from "@/components/animations/KineticText";
import { HeroScene } from "@/components/Scene/HeroScene";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { gsap } from "@/lib/animation/gsap";
import { playHeroEntrance } from "./hero.animations";
import styles from "./Hero.module.css";

export function Hero() {
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const eventInfoRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const targets = [
      eyebrowRef.current,
      subtitleRef.current,
      eventInfoRef.current,
      ctaRef.current,
    ];

    if (reducedMotion) {
      gsap.set(targets.filter(Boolean) as HTMLElement[], { opacity: 1, y: 0 });
      return;
    }

    const timeline = playHeroEntrance(targets);
    return () => {
      timeline.kill();
    };
  }, [reducedMotion]);

  return (
    <section className={styles.hero}>
      <HeroScene />
      <div className={styles.content}>
        <p ref={eyebrowRef} className={styles.eyebrow}>
          75th Indian Pharmaceutical Congress
        </p>
        <KineticText
          as="h1"
          text="75 Years of Pharmacy. The Future Starts Now."
          splitBy="words"
          trigger="mount"
          delay={0.1}
          className={styles.title}
        />
        <p ref={subtitleRef} className={styles.subtitle}>
          A landmark exhibition celebrating India&rsquo;s pharmaceutical
          journey — from foundational discoveries and manufacturing
          excellence to AI, biotechnology, precision medicine and the
          technologies shaping Pharma @2047.
        </p>
        <p ref={eventInfoRef} className={styles.eventInfo}>
          18&ndash;20 December 2026 &middot; Yashobhoomi &middot; New Delhi
        </p>
        <div ref={ctaRef} className={styles.ctaRow}>
          <MagneticButton>
            <a href="#exhibition" className={styles.cta}>
              Explore the Exhibition
            </a>
          </MagneticButton>
          <a href="#pharma-2047" className={styles.ctaSecondary}>
            Discover Pharma @2047
          </a>
        </div>
      </div>
    </section>
  );
}
