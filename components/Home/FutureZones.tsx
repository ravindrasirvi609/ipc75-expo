"use client";

import { useRef, useState } from "react";
import { useScrollReveal } from "@/lib/animation/useScrollReveal";
import { useCursorHover } from "@/providers/CursorProvider";
import sectionStyles from "./sections.module.css";
import styles from "./FutureZones.module.css";

interface Zone {
  id: string;
  number: string;
  label: string;
  title: string;
  copy: string;
  keywords: string[];
}

const ZONES: Zone[] = [
  {
    id: "drug-discovery",
    number: "01",
    label: "Drug Discovery",
    title: "FROM MOLECULE TO MEDICINE",
    copy: "Discover the science behind tomorrow's therapies — from advanced screening and computational discovery to new approaches for developing safer, smarter and more effective medicines.",
    keywords: ["Drug Discovery", "Medicinal Chemistry", "Computational Science", "Novel Therapeutics"],
  },
  {
    id: "biotechnology",
    number: "02",
    label: "Biotechnology",
    title: "BIOLOGY, REIMAGINED",
    copy: "Explore how biotechnology is reshaping the boundaries of medicine — from biologics and biosimilars to advanced platforms that are changing how therapies are discovered and delivered.",
    keywords: ["Biologics", "Biosimilars", "Cell & Gene Technologies", "Biopharmaceuticals"],
  },
  {
    id: "ai-digital-pharma",
    number: "03",
    label: "AI & Digital Pharma",
    title: "WHEN PHARMA MEETS INTELLIGENCE",
    copy: "Artificial intelligence is changing how pharmaceutical decisions are made. From discovery and development to manufacturing, analytics and patient care, intelligent technologies are opening entirely new possibilities.",
    keywords: ["Artificial Intelligence", "Machine Learning", "Data Science", "Digital Health", "Predictive Analytics"],
  },
  {
    id: "precision-medicine",
    number: "04",
    label: "Precision Medicine",
    title: "THE RIGHT MEDICINE. FOR THE RIGHT PATIENT.",
    copy: "Healthcare is moving toward greater personalization. Explore emerging approaches that connect biological data, diagnostics and therapeutics to create more precise and patient-focused healthcare.",
    keywords: ["Precision Medicine", "Genomics", "Diagnostics", "Personalized Healthcare"],
  },
  {
    id: "advanced-manufacturing",
    number: "05",
    label: "Advanced Manufacturing",
    title: "ENGINEERING THE MEDICINE OF TOMORROW",
    copy: "Pharmaceutical manufacturing is entering a new era of automation, intelligence and precision. Experience the technologies transforming how medicines are developed, produced, tested and delivered at scale.",
    keywords: ["Smart Manufacturing", "Automation", "Quality Systems", "Process Technology", "Digital Manufacturing"],
  },
  {
    id: "pharma-powder-technology",
    number: "06",
    label: "Pharma Powder Technology",
    title: "THE SCIENCE OF EVERY PARTICLE",
    copy: "Explore the technologies behind pharmaceutical powders, processing, formulation and manufacturing — where precision at the smallest scale can shape performance at the largest.",
    keywords: ["Powder Processing", "Formulation", "Particle Engineering", "Process Optimization"],
  },
  {
    id: "future-of-healthcare",
    number: "07",
    label: "Future of Healthcare",
    title: "BEYOND THE MEDICINE",
    copy: "Pharmaceutical innovation is becoming part of a larger healthcare ecosystem. Explore how pharmacy, technology, diagnostics, digital health and patient-centered care are converging to create new models of healthcare delivery.",
    keywords: [],
  },
];

interface FutureZonesProps {
  className?: string;
}

export function FutureZones({ className }: FutureZonesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, `.${sectionStyles.reveal}`, { stagger: 0.08 });

  return (
    <section
      id="exhibition"
      ref={sectionRef}
      className={`${sectionStyles.section}${className ? ` ${className}` : ""}`}
    >
      <div className={sectionStyles.inner}>
        <p className={`${sectionStyles.eyebrow} ${sectionStyles.reveal}`}>
          The Future of Pharma
        </p>
        <h2 className={`${sectionStyles.heading} ${sectionStyles.reveal}`}>
          Seven zones. One journey through the future of pharmaceutical
          science.
        </h2>
        <div className={styles.grid}>
          {ZONES.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} revealClassName={sectionStyles.reveal} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ZoneCard({ zone, revealClassName }: { zone: Zone; revealClassName: string }) {
  const [open, setOpen] = useState(false);
  const cursorHover = useCursorHover("open");
  const triggerId = `zone-trigger-${zone.id}`;
  const panelId = `zone-panel-${zone.id}`;

  return (
    <article className={`${styles.card} ${revealClassName}`} data-open={open}>
      <span className={styles.cardNumber} aria-hidden="true">
        {zone.number}
      </span>
      <button
        type="button"
        id={triggerId}
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        {...cursorHover}
      >
        <span className={styles.triggerText}>
          <span className={styles.zoneLabel}>{zone.label}</span>
          <span className={styles.zoneTitle}>{zone.title}</span>
        </span>
        <span className={styles.toggle} aria-hidden="true">
          +
        </span>
      </button>
      <div className={styles.panelWrapper}>
        <div id={panelId} role="region" aria-labelledby={triggerId} className={styles.panelInner}>
          <p className={styles.copy}>{zone.copy}</p>
          {zone.keywords.length > 0 && (
            <ul className={styles.keywords}>
              {zone.keywords.map((keyword) => (
                <li key={keyword} className={styles.keyword}>
                  {keyword}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
