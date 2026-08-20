import Reveal from "@/components/motion/Reveal";
import SplitLines from "@/components/motion/SplitLines";
import Backdrop from "@/components/media/Backdrop";
import type { Backdrop as BackdropData } from "@/lib/media";
import { CONTACTS, EMAILS, EVENT, VENUE, telHref, telLabel } from "@/lib/expo-content";

const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  VENUE.mapQuery,
)}`;

export default function VenueBand({
  backdrop,
}: {
  backdrop: BackdropData | null;
}) {
  return (
    <section className="band band-ice venue has-backdrop" id="venue">
      {/* The venue photo is the one people actually want to see, so it drifts. */}
      <Backdrop media={backdrop} tone="paper" opacity={0.22} parallax />
      <div className="shell">
        <div className="venue-grid">
          <div>
            <p className="eyebrow">Venue</p>
            <SplitLines as="h2" className="display-l">
              {VENUE.name}
            </SplitLines>
            <p className="lede venue-lede">
              {VENUE.aka} — {VENUE.address}. The exhibition occupies{" "}
              {VENUE.hall}, on the same campus as the congress sessions.
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

            <a className="text-link" href={mapHref} target="_blank" rel="noreferrer">
              Open in maps ↗
            </a>
          </div>

          <div className="venue-desk">
            <p className="eyebrow">Exhibition desk</p>
            <p className="venue-desk-lede">
              Four people handle stall bookings. Call whoever picks up.
            </p>
            <Reveal as="ul" className="rep-list" stagger={0.06} distance={14}>
              {CONTACTS.map((contact) => (
                <li key={contact.phone}>
                  <span className="rep-monogram" aria-hidden="true">
                    {contact.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <span className="rep-name">{contact.name}</span>
                  <a className="rep-phone" href={telHref(contact.phone)}>
                    {telLabel(contact.phone)}
                  </a>
                </li>
              ))}
            </Reveal>
            <p className="venue-emails">
              {EMAILS.map((email) => (
                <a key={email} href={`mailto:${email}`}>
                  {email}
                </a>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
