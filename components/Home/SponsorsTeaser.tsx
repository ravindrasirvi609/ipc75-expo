"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import styles from "./sections.module.css";

const DETAILS = [
  { label: "Edition", value: "75th IPC" },
  { label: "Dates", value: "18–20 December 2026" },
  { label: "Venue", value: "Yashobhoomi, New Delhi" },
];

const CREDITS = [
  { label: "Organized by", value: "Indian Pharmaceutical Congress Association (IPCA)" },
  { label: "Hosted by", value: "Indian Pharmacy Graduates' Association (IPGA)" },
  { label: "Academic Partner", value: "SGT University" },
];

export function SponsorsTeaser() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${styles.reveal}`, { y: 20, stagger: 0.08 });

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.reveal}`}>Event Information</p>
        <dl className={`${styles.strip} ${styles.reveal}`}>
          {DETAILS.map((detail) => (
            <div key={detail.label}>
              <dt className={styles.cardLabel}>{detail.label}</dt>
              <dd className={styles.stripItem} style={{ marginTop: "0.35rem" }}>
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
        <dl className={`${styles.strip} ${styles.reveal}`} style={{ marginTop: "1.5rem" }}>
          {CREDITS.map((credit) => (
            <div key={credit.label}>
              <dt className={styles.cardLabel}>{credit.label}</dt>
              <dd className={styles.stripItem} style={{ marginTop: "0.35rem" }}>
                {credit.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
