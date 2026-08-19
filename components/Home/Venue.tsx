"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import { MagneticButton } from "@/components/MagneticButton/MagneticButton";
import styles from "./Venue.module.css";

export function Venue() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { stagger: 0.15 });

  return (
    <section id="venue" ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <div>
          <p className={`${styles.eyebrow} ${styles.reveal}`}>Venue</p>
          <h2 className={`${styles.heading} ${styles.reveal}`}>
            The future has an address.
          </h2>
          <p className={`${styles.venueName} ${styles.reveal}`}>Yashobhoomi</p>
          <p className={`${styles.venueCity} ${styles.reveal}`}>New Delhi, India</p>
          <p className={`${styles.dates} ${styles.reveal}`}>18–20 December 2026</p>
          <p className={`${styles.body} ${styles.reveal}`}>
            A world-class destination for a landmark gathering of India&rsquo;s
            pharmaceutical and healthcare ecosystem.
          </p>
          <div className={`${styles.cta} ${styles.reveal}`}>
            <MagneticButton>
              <a href="#venue" className={styles.ctaLink}>
                Explore the Venue
              </a>
            </MagneticButton>
          </div>
        </div>

        <div className={`${styles.visual} ${styles.reveal}`} aria-hidden="true">
          <div className={styles.ringsWrapper}>
            <span className={styles.ring} />
            <span className={styles.ring} />
            <span className={styles.ring} />
            <span className={styles.ring} />
          </div>
          <div className={styles.pulseWrapper}>
            <span className={styles.pulseRing} style={{ animationDelay: "0s" }} />
            <span className={styles.pulseRing} style={{ animationDelay: "1.1s" }} />
            <span className={styles.pulseRing} style={{ animationDelay: "2.2s" }} />
          </div>
          <div className={styles.compass}>
            <span className={styles.compassLabel}>Yashobhoomi</span>
            <span className={styles.compassLabel}>New Delhi</span>
            <span className={styles.compassLabel}>18–20 Dec 2026</span>
            <span className={styles.compassLabel}>India</span>
          </div>
          <div className={styles.marker}>
            <span className={styles.pin} />
          </div>
        </div>
      </div>
    </section>
  );
}
