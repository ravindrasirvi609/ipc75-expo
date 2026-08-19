import styles from "./Footer.module.css";

const NAV_LINKS = [
  { label: "Exhibition", href: "/#exhibition" },
  { label: "Innovation", href: "/#innovation" },
  { label: "Pharma @2047", href: "/#pharma-2047" },
  { label: "India's Journey", href: "/#india-journey" },
  { label: "People", href: "/#people" },
  { label: "Experience", href: "/#experience" },
  { label: "Venue", href: "/#venue" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <p className={styles.brandName}>75th IPC</p>
          <p className={styles.brandFull}>Indian Pharmaceutical Congress</p>
          <p className={styles.statement}>
            75 Years of Pharmacy. One Vision for 2047.
          </p>
        </div>

        <nav className={styles.nav} aria-label="Section navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.contactBlock}>
          <p className={styles.contactLine}>75th Indian Pharmaceutical Congress</p>
          <p className={styles.contactLine}>Yashobhoomi, New Delhi</p>
          <p className={styles.website}>75thipc.com</p>
        </div>
      </div>
    </footer>
  );
}
