import Link from "next/link";
import {
  EMAILS,
  EVENT,
  ORGANISERS,
  VENUE,
} from "@/lib/expo-content";
import { PUBLIC_FINANCE } from "@/lib/finance";

/**
 * Footer. Carries the things an exhibitor checks before wiring money: who runs
 * the show, and the registration identifiers they can verify independently.
 */
export default function SiteFooter() {
  return (
    <footer className="site-foot band-deep">
      <div className="shell">
        <div className="foot-top">
          <div>
            <p className="eyebrow">{EVENT.parent} · {EVENT.milestone}</p>
            <p className="display-m foot-title">{EVENT.name}</p>
            <p className="lede foot-lede">{EVENT.subtitle}</p>
          </div>
          <div className="foot-meta">
            <div>
              <span className="data-label">Dates</span>
              <p>{EVENT.dates.label}</p>
            </div>
            <div>
              <span className="data-label">Venue</span>
              <p>
                {VENUE.name}
                <br />
                {VENUE.address}
              </p>
            </div>
            <div>
              <span className="data-label">Exhibition desk</span>
              <p>
                {EMAILS.map((email) => (
                  <a key={email} href={`mailto:${email}`}>
                    {email}
                    <br />
                  </a>
                ))}
              </p>
            </div>
          </div>
        </div>

        <div className="measure-rule foot-rule" />

        <div className="foot-bottom">
          <div className="foot-org">
            <span className="data-label">Hosted by</span>
            <p>
              {ORGANISERS.host} ({ORGANISERS.hostShort})
            </p>
            <span className="data-label">Organised by</span>
            <p>
              {ORGANISERS.congress} ({ORGANISERS.congressShort})
            </p>
          </div>

          <dl className="foot-ids">
            <div>
              <dt className="data-label">PAN</dt>
              <dd>{PUBLIC_FINANCE.pan}</dd>
            </div>
            <div>
              <dt className="data-label">GST</dt>
              <dd>{PUBLIC_FINANCE.gst}</dd>
            </div>
            <div>
              <dt className="data-label">CSR reg.</dt>
              <dd>{PUBLIC_FINANCE.csr}</dd>
            </div>
          </dl>

          <nav className="foot-links" aria-label="Related sites">
            {ORGANISERS.sites.map((site) => (
              <a key={site.href} href={site.href} target="_blank" rel="noreferrer">
                {site.label} ↗
              </a>
            ))}
            <Link href="/floor-plan">Floor plan</Link>
            <Link href="/exhibit">Charges</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
