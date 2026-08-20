import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import SpaceCalculator from "@/components/site/SpaceCalculator";
import Reveal from "@/components/motion/Reveal";
import SplitLines from "@/components/motion/SplitLines";
import {
  EMAILS,
  EVENT,
  RATE_UNIT,
  SPACE_TYPES,
  STALL_MODULE,
  VENUE,
  rupees,
} from "@/lib/expo-content";
import { PUBLIC_FINANCE } from "@/lib/finance";
import { STALLS } from "@/lib/hall-1c-plan";
import { getPublicStates } from "@/lib/stall-bookings";
import "@/components/site/site.css";
import "@/components/site/home/home.css";
import "./exhibit.css";

/**
 * Availability is read from disk, which Next cannot see as dynamic — without
 * this the page would be prerendered once and show a frozen stall count. Sixty
 * seconds is plenty: the interactive plan polls the API for live numbers itself.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: `Exhibition charges — ${EVENT.name}`,
  description: `Shell space at ${rupees(SPACE_TYPES[0].rate)} and bare space at ${rupees(SPACE_TYPES[1].rate)} per sq. m plus taxes in ${VENUE.hall}, ${VENUE.name}.`,
};

/** A real sequence, so it is numbered. */
const STEPS = [
  {
    title: "Choose your stalls on the plan",
    body: `Hall 1C is drawn to the surveyed grid. Click the stalls you want — up to 20 in one request — and the plan totals the area as you go.`,
  },
  {
    title: "Send the request",
    body: "Company, contact, email and phone. Your stalls go on hold immediately and stop showing as available to anyone else.",
  },
  {
    title: "The desk confirms and invoices",
    body: "The exhibition team checks the request, confirms the hold as a booking and issues the invoice with payment instructions.",
  },
];

export default async function ExhibitPage() {
  const availability = await getPublicStates();
  const available = STALLS.length - availability.stalls.length;

  return (
    <>
      <SiteHeader solid />
      <main className="head-offset">
        <section className="band band-deep page-lead">
          <div className="shell">
            <p className="eyebrow">Participation</p>
            <SplitLines as="h1" className="display-xl page-title" onLoad delay={0.1}>
              Take space in {VENUE.hall}.
            </SplitLines>
            <p className="lede page-lede">
              {STALLS.length} stalls of {STALL_MODULE.size}, laid out on the
              surveyed grid. {available} are still open. Both space types are
              priced per square metre before tax.
            </p>
          </div>
        </section>

        <section className="band band-sheet rates">
          <div className="shell">
            <p className="eyebrow">Charges</p>
            <SplitLines as="h2" className="display-l rates-title">
              Shell or bare.
            </SplitLines>

            <Reveal className="rate-table" stagger={0.1}>
              {SPACE_TYPES.map((space) => (
                <article className="rate-line" key={space.id}>
                  <div className="rate-line-name">
                    <h3 className="display-m">{space.name}</h3>
                    <p>{space.summary}</p>
                  </div>
                  <p className="rate-line-figure">
                    {rupees(space.rate)}
                    <span>{RATE_UNIT}</span>
                  </p>
                  <p className="rate-line-detail">{space.detail}</p>
                  <p className="rate-line-module">
                    <span className="data-label">
                      One stall · {STALL_MODULE.area} sqm
                    </span>
                    {rupees(space.rate * STALL_MODULE.area)} + taxes
                  </p>
                </article>
              ))}
            </Reveal>

            <div className="inclusions">
              <div>
                <h3 className="display-m">What each includes</h3>
                <p className="lede">
                  The brochure sets the rates but not the fit-out schedule, so we
                  are not going to guess at it here. Ask the desk for the current
                  inclusions sheet — fascia, power load, furniture and rigging
                  rules all live on it.
                </p>
              </div>
              <div className="inclusions-actions">
                {EMAILS.map((email) => (
                  <a className="btn btn-ghost" key={email} href={`mailto:${email}?subject=Inclusions sheet — ${EVENT.name}`}>
                    Ask {email}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="band band-ice calc-band" id="calculator">
          <div className="shell">
            <p className="eyebrow">Work out the cost</p>
            <SplitLines as="h2" className="display-l calc-title">
              Cost of a block.
            </SplitLines>
            <SpaceCalculator />
          </div>
        </section>

        <section className="band band-sheet steps">
          <div className="shell">
            <p className="eyebrow">How booking works</p>
            <SplitLines as="h2" className="display-l steps-title">
              Three steps, in order.
            </SplitLines>
            <Reveal as="ol" className="step-list" stagger={0.1}>
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className="step-number">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </Reveal>
          </div>
        </section>

        <section className="band band-floor pay-band">
          <div className="shell pay-grid">
            <div>
              <p className="eyebrow">Payment</p>
              <SplitLines as="h2" className="display-l">
                Payable to {PUBLIC_FINANCE.payee}.
              </SplitLines>
              <p className="lede pay-lede">
                {PUBLIC_FINANCE.instruments.join(", ")} — payable at{" "}
                {PUBLIC_FINANCE.payableAt}. Bank account details are issued with
                your invoice, or on request from the contact page.
              </p>
              <Link className="btn btn-primary" href="/contact#payment">
                Request payment details
              </Link>
            </div>
            <dl className="pay-ids">
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
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
