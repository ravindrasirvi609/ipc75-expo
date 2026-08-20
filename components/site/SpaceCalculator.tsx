"use client";

import Link from "next/link";
import { useState } from "react";
import {
  INDICATIVE_GST,
  SPACE_TYPES,
  STALL_MODULE,
  rupees,
} from "@/lib/expo-content";
import { MAX_STALLS_PER_REQUEST } from "@/lib/booking-limits";

/**
 * Works out what a block of stalls costs.
 *
 * Stalls are the unit exhibitors actually buy, so that is the input. Ex-tax
 * totals are the headline figure because that is what the brochure quotes; the
 * GST line is labelled indicative because the brochure says only "plus Taxes".
 */
export default function SpaceCalculator() {
  const [stalls, setStands] = useState(2);
  const area = stalls * STALL_MODULE.area;

  return (
    <div className="calc">
      <div className="calc-input">
        <label htmlFor="stalls">
          <span className="data-label">How many stalls</span>
          <span className="calc-hint">
            {STALL_MODULE.size} each · up to {MAX_STALLS_PER_REQUEST} per request
          </span>
        </label>
        <div className="calc-stepper">
          <button
            type="button"
            onClick={() => setStands((n) => Math.max(1, n - 1))}
            disabled={stalls <= 1}
            aria-label="One stall fewer"
          >
            −
          </button>
          <input
            id="stalls"
            type="number"
            min={1}
            max={MAX_STALLS_PER_REQUEST}
            value={stalls}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isNaN(next)) return;
              setStands(Math.min(MAX_STALLS_PER_REQUEST, Math.max(1, next)));
            }}
          />
          <button
            type="button"
            onClick={() =>
              setStands((n) => Math.min(MAX_STALLS_PER_REQUEST, n + 1))
            }
            disabled={stalls >= MAX_STALLS_PER_REQUEST}
            aria-label="One stall more"
          >
            +
          </button>
        </div>
        <p className="calc-area">
          <span className="data-label">Floor area</span>
          {area} sqm
        </p>
      </div>

      <div className="calc-results">
        {SPACE_TYPES.map((space) => {
          const net = space.rate * area;
          const tax = Math.round(net * INDICATIVE_GST);
          return (
            <div className="calc-card" key={space.id}>
              <h3>{space.name}</h3>
              <p className="calc-net">{rupees(net)}</p>
              <p className="calc-unit">
                {rupees(space.rate)} × {area} sqm, before tax
              </p>
              <dl className="calc-breakdown">
                <div>
                  <dt>GST at {Math.round(INDICATIVE_GST * 100)}% (indicative)</dt>
                  <dd>{rupees(tax)}</dd>
                </div>
                <div className="is-total">
                  <dt>Indicative total</dt>
                  <dd>{rupees(net + tax)}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      <p className="calc-caveat">
        The brochure quotes both rates as “plus Taxes” without naming a rate. The
        GST line above assumes {Math.round(INDICATIVE_GST * 100)}% so you have a
        working figure — the exhibition desk confirms the exact tax on your
        invoice. Nothing here is a quotation.
      </p>

      <Link className="btn btn-primary" href="/floor-plan">
        Pick {stalls === 1 ? "a stall" : `${stalls} stalls`} on the plan
      </Link>
    </div>
  );
}
