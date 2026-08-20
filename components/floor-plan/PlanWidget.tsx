"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STALLS, VIEW_BOX, getStall, type Stall } from "@/lib/hall-1c-plan";
import type { PublicStallState, StallStatus } from "@/lib/stall-bookings";
import HallPlanSvg from "./HallPlanSvg";
import { usePanZoom } from "./usePanZoom";
import "./plan.css";

const MAX_SELECTION = 20;
const REFRESH_MS = 45_000;

type Form = {
  company: string;
  contact: string;
  email: string;
  phone: string;
  note: string;
};
const EMPTY_FORM: Form = {
  company: "",
  contact: "",
  email: "",
  phone: "",
  note: "",
};

type Feedback = { kind: "error" | "success"; message: string } | null;

export type PlanWidgetProps = {
  /** Availability read on the server, so the first paint is already correct. */
  availability: PublicStallState[];
  /** Stalls to preselect and zoom to, from a `?stall=` deep link. */
  initialSelection?: string[];
  /** `embed` fills its frame; `page` sits inside the site layout. */
  variant?: "embed" | "page";
  theme?: "light" | "dark";
};

/** Tells the host page what the widget is doing, for iframe embedding. */
function postToHost(payload: Record<string, unknown>) {
  if (typeof window === "undefined" || window.parent === window) return;
  window.parent.postMessage({ source: "ipc75-floor-plan", ...payload }, "*");
}

export default function PlanWidget({
  availability,
  initialSelection = [],
  variant = "page",
  theme = "light",
}: PlanWidgetProps) {
  const [taken, setTaken] = useState<PublicStallState[]>(availability);
  const [selected, setSelected] = useState<string[]>(() =>
    initialSelection.slice(0, MAX_SELECTION),
  );
  const [hovered, setHovered] = useState<Stall | null>(null);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const pz = usePanZoom(
    VIEW_BOX,
    initialSelection.length ? getStall(initialSelection[0]) : undefined,
  );
  const shellRef = useRef<HTMLDivElement | null>(null);

  const { statuses, companies } = useMemo(() => {
    const statuses: Record<string, StallStatus> = {};
    const companies: Record<string, string | undefined> = {};
    for (const entry of taken) {
      statuses[entry.id] = entry.status;
      companies[entry.id] = entry.company;
    }
    return { statuses, companies };
  }, [taken]);

  const counts = useMemo(() => {
    const booked = taken.filter((s) => s.status === "booked").length;
    const hold = taken.filter((s) => s.status === "hold").length;
    return {
      booked,
      hold,
      available: STALLS.length - booked - hold,
      total: STALLS.length,
    };
  }, [taken]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/stalls", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as { stalls: PublicStallState[] };
      setTaken(data.stalls ?? []);
    } catch {
      // Availability just stays as last known - the plan itself still works.
    }
  }, []);

  /**
   * The server already supplied availability, so this only keeps it fresh:
   * on a timer and whenever the tab regains focus.
   */
  useEffect(() => {
    const timer = setInterval(() => void refresh(), REFRESH_MS);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  useEffect(() => {
    postToHost({ type: "selection", stalls: selected });
  }, [selected]);

  /** Lets a host page size the iframe to the widget. */
  useEffect(() => {
    const element = shellRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      postToHost({
        type: "height",
        height: Math.ceil(entry.contentRect.height),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 1) return new Set<string>();
    return new Set(
      STALLS.filter((stall) => {
        const company = companies[stall.id]?.toLowerCase() ?? "";
        return (
          stall.id.toLowerCase().includes(term) ||
          stall.label.toLowerCase().includes(term) ||
          (company && company.includes(term))
        );
      }).map((stall) => stall.id),
    );
  }, [companies, query]);

  const toggle = useCallback(
    (stall: Stall) => {
      if (pz.hasDragged()) return;
      const status = statuses[stall.id];
      if (status === "booked" || status === "hold") {
        setFeedback({
          kind: "error",
          message:
            status === "booked"
              ? `${stall.id} is already booked${companies[stall.id] ? ` by ${companies[stall.id]}` : ""}.`
              : `${stall.id} is on hold for another exhibitor.`,
        });
        return;
      }
      setFeedback(null);
      setSelected((current) => {
        if (current.includes(stall.id))
          return current.filter((id) => id !== stall.id);
        if (current.length >= MAX_SELECTION) {
          setFeedback({
            kind: "error",
            message: `You can request up to ${MAX_SELECTION} stalls at a time.`,
          });
          return current;
        }
        return [...current, stall.id];
      });
    },
    [companies, pz, statuses],
  );

  const jumpToFirstMatch = useCallback(() => {
    const first = STALLS.find((stall) => matches.has(stall.id));
    if (first) pz.focusRect(first);
  }, [matches, pz]);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (submitting) return;
      setSubmitting(true);
      setFeedback(null);
      try {
        const response = await fetch("/api/stalls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stalls: selected, ...form }),
        });
        const result = await response.json();
        if (response.ok && result.ok) {
          const held: string[] = result.held ?? [];
          setFeedback({
            kind: "success",
            message: `Request received. ${held.join(", ")} ${held.length === 1 ? "is" : "are"} now on hold — our team will confirm by email.`,
          });
          postToHost({
            type: "hold-created",
            stalls: held,
            company: form.company,
          });
          setSelected([]);
          setForm(EMPTY_FORM);
          setFormOpen(false);
        } else if (result.reason === "conflict") {
          const clashing: PublicStallState[] = result.taken ?? [];
          setFeedback({
            kind: "error",
            message: `Taken while you were choosing: ${clashing.map((s) => s.id).join(", ")}. Nothing was booked — pick again.`,
          });
          setSelected((current) =>
            current.filter((id) => !clashing.some((s) => s.id === id)),
          );
        } else {
          setFeedback({
            kind: "error",
            message: result.message ?? "That request could not be saved.",
          });
        }
      } catch {
        setFeedback({
          kind: "error",
          message: "Network problem — your request was not sent.",
        });
      } finally {
        setSubmitting(false);
        void refresh();
      }
    },
    [form, refresh, selected, submitting],
  );

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const detail =
    hovered ?? (selected.length === 1 ? getStall(selected[0]) : undefined);
  const detailStatus = detail
    ? selected.includes(detail.id)
      ? "selected"
      : (statuses[detail.id] ?? "available")
    : null;

  return (
    <div ref={shellRef} className={`hp-shell hp-${variant} hp-theme-${theme}`}>
      <header className="hp-bar">
        <div className="hp-title">
          <strong>75th IPC · IICC — Hall 1C</strong>
          <span>
            {counts.available} of {counts.total} stalls available · 3m × 3m · 9
            sqm
          </span>
        </div>

        <div className="hp-tools">
          <form
            className="hp-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              jumpToFirstMatch();
            }}
          >
            <input
              type="search"
              value={query}
              placeholder="Find stall or exhibitor"
              aria-label="Find a stall number or exhibitor"
              onChange={(event) => setQuery(event.target.value)}
            />
            {query ? <em>{matches.size}</em> : null}
          </form>
          <div className="hp-zoom">
            <button
              type="button"
              onClick={() => pz.zoomBy(1.35)}
              disabled={!pz.canZoomIn}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => pz.zoomBy(1 / 1.35)}
              disabled={!pz.canZoomOut}
              aria-label="Zoom out"
            >
              −
            </button>
            <button type="button" onClick={pz.reset} disabled={pz.isDefault}>
              Fit
            </button>
          </div>
        </div>
      </header>

      <div className="hp-viewport">
        <HallPlanSvg
          statuses={statuses}
          selected={selectedSet}
          highlighted={matches}
          companies={companies}
          onActivate={toggle}
          onHover={setHovered}
          transform={pz.transform}
          svgRef={pz.svgRef}
          gestures={pz.handlers}
        />

        <ul className="hp-legend">
          <li>
            <i className="sw-available" />
            Available
          </li>
          <li>
            <i className="sw-selected" />
            Your selection
          </li>
          <li>
            <i className="sw-hold" />
            On hold
          </li>
          <li>
            <i className="sw-booked" />
            Booked
          </li>
          <li>
            <i className="sw-blocked" />
            Not for sale
          </li>
        </ul>

        {detail && detailStatus ? (
          <div className="hp-readout" role="status">
            <b>{detail.label}</b>
            <span>
              {detail.size} · {detail.area} sqm
            </span>
            <span className={`hp-tag is-${detailStatus}`}>
              {detailStatus === "hold" ? "on hold" : detailStatus}
            </span>
            {companies[detail.id] ? (
              <span className="hp-who">{companies[detail.id]}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <footer className="hp-tray">
        {feedback ? (
          <p className={`hp-feedback is-${feedback.kind}`} role="alert">
            {feedback.message}
          </p>
        ) : null}

        {selected.length === 0 ? (
          <p className="hp-hint">
            Tap any white stall to select it. Drag to pan, scroll or pinch to
            zoom.
          </p>
        ) : (
          <div className="hp-picked">
            <div className="hp-chips">
              {selected.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="hp-chip"
                  onClick={() =>
                    setSelected((current) => current.filter((x) => x !== id))
                  }
                  aria-label={`Remove ${id} from your selection`}
                >
                  {id} <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
            <div className="hp-picked-actions">
              <span className="hp-total">
                {selected.length} stall{selected.length === 1 ? "" : "s"} ·{" "}
                {selected.length * 9} sqm
              </span>
              <button
                type="button"
                className="hp-ghost"
                onClick={() => setSelected([])}
              >
                Clear
              </button>
              <button
                type="button"
                className="hp-cta"
                onClick={() => setFormOpen((open) => !open)}
              >
                {formOpen ? "Hide form" : "Request these stalls"}
              </button>
            </div>
          </div>
        )}

        {formOpen && selected.length > 0 ? (
          <form className="hp-form" onSubmit={submit}>
            <label>
              Company / organisation
              <input
                required
                maxLength={120}
                value={form.company}
                onChange={(event) =>
                  setForm({ ...form, company: event.target.value })
                }
              />
            </label>
            <label>
              Contact name
              <input
                required
                maxLength={120}
                value={form.contact}
                onChange={(event) =>
                  setForm({ ...form, contact: event.target.value })
                }
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                maxLength={160}
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label>
              Phone <small>optional</small>
              <input
                type="tel"
                maxLength={40}
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </label>
            <label className="hp-wide">
              Anything we should know <small>optional</small>
              <textarea
                rows={2}
                maxLength={500}
                value={form.note}
                onChange={(event) =>
                  setForm({ ...form, note: event.target.value })
                }
              />
            </label>
            <div className="hp-submit">
              <p>
                Submitting places a hold on {selected.join(", ")}. Our team
                confirms by email; nothing is charged here.
              </p>
              <button type="submit" className="hp-cta" disabled={submitting}>
                {submitting
                  ? "Sending…"
                  : `Hold ${selected.length} stall${selected.length === 1 ? "" : "s"}`}
              </button>
            </div>
          </form>
        ) : null}
      </footer>
    </div>
  );
}
