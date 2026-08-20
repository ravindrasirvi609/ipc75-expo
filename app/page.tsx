"use client";
import { useState } from "react";
const cats = [
  "Biotechnology",
  "APIs & Ingredients",
  "Manufacturing",
  "AI + Digital Health",
  "Medical Devices",
  "Packaging",
  "R&D",
  "Automation",
];
const stalls = [
  {
    id: "A101",
    size: "12 SQM",
    status: "available",
    x: 8,
    y: 23,
    w: 17,
    h: 18,
  },
  {
    id: "A102",
    size: "18 SQM",
    status: "reserved",
    x: 28,
    y: 23,
    w: 21,
    h: 18,
  },
  {
    id: "A103",
    size: "24 SQM",
    status: "available",
    x: 52,
    y: 23,
    w: 27,
    h: 18,
  },
  {
    id: "B201",
    size: "12 SQM",
    status: "available",
    x: 8,
    y: 49,
    w: 17,
    h: 19,
  },
  { id: "B202", size: "36 SQM", status: "sold", x: 28, y: 49, w: 32, h: 19 },
  {
    id: "B203",
    size: "18 SQM",
    status: "available",
    x: 63,
    y: 49,
    w: 16,
    h: 19,
  },
];
export default function Home() {
  const [selected, setSelected] = useState(stalls[2]);
  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top">
          <span>IPC</span>
          <i>75</i>
        </a>
        <div className="navlinks">
          <a href="#why">Why exhibit</a>
          <a href="#floor">Floor plan</a>
          <a href="#info">The event</a>
        </div>
        <a className="navcta" href="#book">
          Book a stall <b>↗</b>
        </a>
      </nav>
      <section className="hero" id="top">
        <div className="grid-orb orb-one" />
        <div className="grid-orb orb-two" />
        <div className="molecule">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">
            75th Indian Pharmaceutical Congress · Exhibition
          </p>
          <h1>
            THE FUTURE
            <br />
            <em>OF PHARMA.</em>
          </h1>
          <p className="hero-lede">
            The industry&apos;s most ambitious minds, brands and breakthroughs —
            under one roof.
          </p>
          <div className="actions">
            <a className="button primary" href="#book">
              Book your stall <span>↗</span>
            </a>
            <a className="text-link" href="#floor">
              Explore the exhibition <span>↓</span>
            </a>
          </div>
        </div>
        <div className="hero-footer">
          <span>01 — 04</span>
          <span className="scrollhint">
            Scroll to enter <b>↓</b>
          </span>
          <span>Pharma / Science / Opportunity</span>
        </div>
      </section>
      <section className="manifesto" id="why">
        <p className="eyebrow coral">A platform built for momentum</p>
        <h2>
          YOUR INDUSTRY
          <br />
          <span>IS HERE.</span>
          <br />
          IS YOUR BRAND?
        </h2>
        <p className="manifesto-copy">
          This is where the next decade of pharmaceutical progress gets a front
          row seat. Put your products, people and point of view in the middle of
          the conversation.
        </p>
        <div className="stat-row">
          <div>
            <strong>
              10<span>k+</span>
            </strong>
            <small>Industry professionals</small>
          </div>
          <div>
            <strong>
              500<span>+</span>
            </strong>
            <small>Exhibitors &amp; brands</small>
          </div>
          <div>
            <strong>01</strong>
            <small>Unmissable opportunity</small>
          </div>
        </div>
      </section>
      <section className="signal">
        <div className="signal-label">
          WHY BE HERE <span>↘</span>
        </div>
        <div className="signal-list">
          <div>
            <span>01</span>
            <h3>Be impossible to miss.</h3>
            <p>
              Turn your brand into a destination for the people shaping pharma.
            </p>
          </div>
          <div>
            <span>02</span>
            <h3>Meet the decision makers.</h3>
            <p>Compress months of outreach into high-value conversations.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Make the next move.</h3>
            <p>Launch, partner, source and build what comes next.</p>
          </div>
        </div>
      </section>
      <section className="categories">
        <div className="section-head">
          <p className="eyebrow">The ecosystem</p>
          <h2>
            EVERY FRONTIER
            <br />
            <span>OF PHARMA.</span>
          </h2>
        </div>
        <div className="category-track">
          {cats.map((c, i) => (
            <div className="category" key={c}>
              <span>0{i + 1}</span>
              <b>{c}</b>
              <i>↗</i>
            </div>
          ))}
        </div>
      </section>
      <section className="floor" id="floor">
        <div className="floor-intro">
          <p className="eyebrow coral">Live floor plan · POC</p>
          <h2>
            FIND YOUR
            <br />
            <em>FOOTPRINT.</em>
          </h2>
          <p>
            Place your brand where the industry is looking. Select a space to
            see its details.
          </p>
          <div className="legend">
            <span>
              <i className="available" /> Available
            </span>
            <span>
              <i className="reserved" /> Reserved
            </span>
            <span>
              <i className="sold" /> Sold
            </span>
          </div>
        </div>
        <div className="map-wrap">
          <div className="map">
            <div className="stage">MAIN STAGE</div>
            <div className="lounge">
              NETWORKING
              <br />
              LOUNGE
            </div>
            <div className="aisle-label">NORTH HALL · LEVEL 01</div>
            {stalls.map((s) => (
              <button
                key={s.id}
                disabled={s.status === "sold"}
                onClick={() => setSelected(s)}
                className={`stall ${s.status} ${selected.id === s.id ? "selected" : ""}`}
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${s.w}%`,
                  height: `${s.h}%`,
                }}
              >
                <b>{s.id}</b>
                <small>{s.size}</small>
              </button>
            ))}
          </div>
          <div className="stall-detail">
            <span className={`status-dot ${selected.status}`} />
            <b>STALL {selected.id}</b>
            <span>
              {selected.size} · {selected.status.toUpperCase()}
            </span>
            <a href="#book">Enquire about this space ↗</a>
          </div>
        </div>
      </section>
      <section className="booking" id="book">
        <div className="booking-top">
          <span>05 — Participation</span>
          <span>IPC 75 / Exhibition</span>
        </div>
        <h2>
          YOUR SPACE
          <br />
          <em>IS WAITING.</em>
        </h2>
        <p>
          Exhibit your brand. Meet your industry. Create your next opportunity.
        </p>
        <a
          className="button primary"
          href="mailto:exhibition@ipc75.com?subject=Stall%20booking%20enquiry"
        >
          Book your stall <span>↗</span>
        </a>
        <div className="booking-bottom">
          <a href="mailto:exhibition@ipc75.com">
            Talk to the exhibition team ↗
          </a>
          <a href="#floor">View stall layout ↓</a>
        </div>
      </section>
      <section className="info" id="info">
        <div>
          <p className="eyebrow">Mark the coordinates</p>
          <h2>
            THE EVENT
            <br />
            <span>IS CALLING.</span>
          </h2>
        </div>
        <div className="info-grid">
          <div>
            <small>Exhibition dates</small>
            <b>06 — 08 DEC 2025</b>
          </div>
          <div>
            <small>Venue</small>
            <b>HITEX, HYDERABAD</b>
          </div>
          <div>
            <small>Exhibition hours</small>
            <b>09:00 — 18:00</b>
          </div>
          <div>
            <small>Presented by</small>
            <b>INDIAN PHARMACEUTICAL CONGRESS ASSOCIATION</b>
          </div>
        </div>
      </section>
      <footer>
        <a className="brand" href="#top">
          <span>IPC</span>
          <i>75</i>
        </a>
        <span>THE FUTURE OF PHARMA.</span>
        <span>© 2025 IPC 75</span>
      </footer>
    </main>
  );
}
