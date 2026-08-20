import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PaymentRequest from "@/components/site/PaymentRequest";
import Reveal from "@/components/motion/Reveal";
import SplitLines from "@/components/motion/SplitLines";
import {
  CONTACTS,
  EMAILS,
  EVENT,
  ORGANISERS,
  VENUE,
  telHref,
  telLabel,
} from "@/lib/expo-content";
import { PUBLIC_FINANCE } from "@/lib/finance";
import "@/components/site/site.css";
import "@/components/site/home/home.css";
import "../exhibit/exhibit.css";
import "./contact.css";

export const metadata: Metadata = {
  title: `Contact the exhibition desk — ${EVENT.name}`,
  description: `Stand bookings for ${EVENT.name} at ${VENUE.name}, ${VENUE.city}. Call the exhibition team or email ${EMAILS[0]}.`,
};

const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  VENUE.mapQuery,
)}`;

export default function ContactPage() {
  return (
    <>
      <SiteHeader solid />
      <main className="head-offset">
        <section className="band band-deep page-lead">
          <div className="shell">
            <p className="eyebrow">Exhibition desk</p>
            <SplitLines as="h1" className="display-xl page-title" onLoad delay={0.1}>
              Talk to someone who can hold the space.
            </SplitLines>
            <p className="lede page-lede">
              Four people handle stand bookings for {EVENT.shortName}. Call any of
              them, or email the desk and they will come back with availability.
            </p>
          </div>
        </section>

        <section className="band band-sheet reps">
          <div className="shell">
            <Reveal className="rep-grid" stagger={0.08}>
              {CONTACTS.map((contact) => (
                <article className="rep-card" key={contact.phone}>
                  {/* Monogram stands in for a headshot — swap when you have photos. */}
                  <span className="rep-card-monogram" aria-hidden="true">
                    {contact.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <h2>{contact.name}</h2>
                  <a className="rep-card-phone" href={telHref(contact.phone)}>
                    {telLabel(contact.phone)}
                  </a>
                </article>
              ))}
            </Reveal>

            <div className="mail-row">
              <p className="data-label">Or email the desk</p>
              <div>
                {EMAILS.map((email) => (
                  <a className="btn btn-ghost" key={email} href={`mailto:${email}`}>
                    {email}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="band band-ice venue-band">
          <div className="shell venue-band-grid">
            <div>
              <p className="eyebrow">Getting there</p>
              <SplitLines as="h2" className="display-l">
                {VENUE.name}
              </SplitLines>
              <p className="lede venue-lede">
                {VENUE.aka}
                <br />
                {VENUE.address}
              </p>
              <dl className="venue-facts">
                <div>
                  <dt className="data-label">Dates</dt>
                  <dd>{EVENT.dates.label}</dd>
                </div>
                <div>
                  <dt className="data-label">Days</dt>
                  <dd>{EVENT.dates.days}</dd>
                </div>
                <div>
                  <dt className="data-label">Hall</dt>
                  <dd>{VENUE.hall}</dd>
                </div>
              </dl>
              <div className="venue-band-actions">
                <a className="btn btn-ghost" href={mapHref} target="_blank" rel="noreferrer">
                  Open in maps ↗
                </a>
                <Link className="btn btn-primary" href="/floor-plan">
                  See the floor plan
                </Link>
              </div>
            </div>

            <aside className="org-card">
              <p className="eyebrow">Who runs it</p>
              <dl>
                <div>
                  <dt className="data-label">Hosted by</dt>
                  <dd>
                    {ORGANISERS.host}
                    <br />
                    <span>({ORGANISERS.hostShort})</span>
                  </dd>
                </div>
                <div>
                  <dt className="data-label">Organised by</dt>
                  <dd>
                    {ORGANISERS.congress}
                    <br />
                    <span>({ORGANISERS.congressShort})</span>
                  </dd>
                </div>
                <div>
                  <dt className="data-label">Theme</dt>
                  <dd>{EVENT.theme}</dd>
                </div>
              </dl>
              <div className="org-links">
                {ORGANISERS.sites.map((site) => (
                  <a key={site.href} className="text-link" href={site.href} target="_blank" rel="noreferrer">
                    {site.label} ↗
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="band band-floor pay-band" id="payment">
          <div className="shell pay-grid">
            <div>
              <p className="eyebrow">Payment</p>
              <SplitLines as="h2" className="display-l">
                Payable to {PUBLIC_FINANCE.payee}.
              </SplitLines>
              <p className="lede pay-lede">
                {PUBLIC_FINANCE.instruments.join(", ")} — payable at{" "}
                {PUBLIC_FINANCE.payableAt}. These identifiers are published so you
                can verify us independently before you transfer anything.
              </p>
              <dl className="pay-ids pay-ids-inline">
                <div>
                  <dt className="data-label">PAN</dt>
                  <dd>{PUBLIC_FINANCE.pan}</dd>
                </div>
                <div>
                  <dt className="data-label">GST</dt>
                  <dd>{PUBLIC_FINANCE.gst}</dd>
                </div>
                <div>
                  <dt className="data-label">CSR registration</dt>
                  <dd>{PUBLIC_FINANCE.csr}</dd>
                </div>
              </dl>
            </div>
            <PaymentRequest />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
