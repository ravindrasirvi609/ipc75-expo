"use client";

import { useEffect, useRef } from "react";
import { RoomLink } from "@/components/RoomTransition/RoomLink";
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
  const ctaRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const targets = [eyebrowRef.current, subtitleRef.current, ctaRef.current];

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
          75th Edition
        </p>
        <KineticText
          as="h1"
          text="Indian Pharmaceutical Congress"
          splitBy="words"
          trigger="mount"
          delay={0.1}
          className={styles.title}
        />
        <p ref={subtitleRef} className={styles.subtitle}>
          A digital exhibition marking seventy-five years of pharmaceutical
          science, discovery, and community in India.
        </p>
        <div ref={ctaRef}>
          <MagneticButton>
            <RoomLink href="/register" direction="forward" className={styles.cta}>
              Register
            </RoomLink>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
