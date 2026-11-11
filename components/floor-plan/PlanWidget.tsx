"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Scan, Search, TriangleAlert, X } from "lucide-react";
import { STALLS, VIEW_BOX, getStall, type Stall } from "@/lib/hall-1c-plan";
import type { PublicStallState, StallStatus } from "@/lib/stall-bookings";
import { MAX_STALLS_PER_REQUEST } from "@/lib/booking-limits";
import HallPlanSvg from "./HallPlanSvg";
import { usePanZoom } from "./usePanZoom";
import "./plan.css";

/** Same cap the API enforces, so the UI never offers what the server refuses. */
const MAX_SELECTION = MAX_STALLS_PER_REQUEST;
const REFRESH_MS = 45_000;

type Form = {
  company: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gstNumber: string;
  note: string;
};
const EMPTY_FORM: Form = {
  company: "",
  contact: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  gstNumber: "",
  note: "",
};

type FormErrors = Partial<Record<keyof Form, string>>;

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;

/** Mirrors the checks in /api/stalls, plus format checks the server leaves to us. */
function validateForm(form: Form): FormErrors {
  const errors: FormErrors = {};
  if (!form.company.trim()) errors.company = "Enter your company or organisation name.";
  if (!form.gstNumber.trim()) errors.gstNumber = "Enter your GST number.";
  else if (!GSTIN.test(form.gstNumber.trim()))
    errors.gstNumber = "A GST number has 15 characters, like 07AAACI1234F1Z5.";
  if (!form.contact.trim()) errors.contact = "Enter the name of the person we should contact.";
  if (!form.email.trim()) errors.email = "Enter an email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
    errors.email = "That email address looks wrong.";
  const digits = form.phone.replace(/\D/g, "");
  if (!form.phone.trim()) errors.phone = "Enter a WhatsApp number.";
  else if (digits.length < 10 || digits.length > 15)
    errors.phone = "Enter a 10-digit number, with country code if outside India.";
  if (!form.address.trim()) errors.address = "Enter your billing address.";
  if (!form.city.trim()) errors.city = "Enter your city.";
  if (!form.state.trim()) errors.state = "Enter your state.";
  return errors;
}

type Feedback = { kind: "error" | "success"; message: string } | null;

export type PlanWidgetProps = {
  /** Availability read on the server, so the first paint is already correct. */
  availability: PublicStallState[];
  /** True when the server couldn't read live availability — `availability` is `[]`, not "all free." */
  availabilityUnknown?: boolean;
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
  availabilityUnknown = false,
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
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
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
        setFormOpen(true);
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
      const problems = validateForm(form);
      setErrors(problems);
      const firstInvalid = Object.keys(problems)[0];
      if (firstInvalid) {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
          ?.focus();
        return;
      }
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

  type FieldOptions = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "name" | "value" | "onChange"
  > & { wide?: boolean; hint?: string; transform?: (value: string) => string };

  /** A labelled, required input with its hint and inline error wired up for screen readers. */
  const field = (name: keyof Form, label: string, options: FieldOptions = {}) => {
    const { wide, hint, transform, ...input } = options;
    const error = errors[name];
    const describedBy = error ? `hp-${name}-error` : hint ? `hp-${name}-hint` : undefined;
    return (
      <label className={`hp-field${wide ? " hp-wide" : ""}${error ? " has-error" : ""}`}>
        <span>
          {label} <em aria-hidden="true">*</em>
        </span>
        <input
          {...input}
          name={name}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          value={form[name]}
          onChange={(event) => {
            const value = transform ? transform(event.target.value) : event.target.value;
            setForm({ ...form, [name]: value });
            if (error) setErrors({ ...errors, [name]: undefined });
          }}
        />
        {error ? (
          <small id={`hp-${name}-error`} className="hp-error">
            {error}
          </small>
        ) : hint ? (
          <small id={`hp-${name}-hint`}>{hint}</small>
        ) : null}
      </label>
    );
  };

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
            <Search className="hp-search-icon" size={13} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              value={query}
              placeholder="Find stall or company"
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
              <Plus size={14} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => pz.zoomBy(1 / 1.35)}
              disabled={!pz.canZoomOut}
              aria-label="Zoom out"
            >
              <Minus size={14} strokeWidth={1.75} />
            </button>
            <button type="button" onClick={pz.reset} disabled={pz.isDefault}>
              <Scan size={13} strokeWidth={1.75} />
              Fit
            </button>
          </div>
        </div>
      </header>

      {availabilityUnknown ? (
        <p className="hp-unavailable" role="status">
          <TriangleAlert size={14} strokeWidth={1.75} aria-hidden="true" />
          Live availability could not be loaded — colours below may be out of
          date. Refresh, or confirm with the desk before assuming a stall is
          free.
        </p>
      ) : null}

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
                  {id} <X size={12} strokeWidth={2} aria-hidden="true" />
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
          <div className="hp-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
          <form
            ref={formRef}
            className="hp-form hp-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hp-form-title"
            noValidate
            onSubmit={submit}
            onKeyDown={(event) => {
              if (event.key === "Escape") setFormOpen(false);
            }}
          >
            <div className="hp-dialog-head">
              <div>
                <span className="hp-eyebrow">Stall request</span>
                <h2 id="hp-form-title">Tell us about your organisation</h2>
                <p>
                  We use these details to hold your stalls and prepare your
                  invoice. It takes about two minutes.
                </p>
              </div>
              <button
                type="button"
                className="hp-dialog-close"
                onClick={() => setFormOpen(false)}
                aria-label="Close request form"
              >
                <X size={18} />
              </button>
            </div>

            <div className="hp-summary">
              <div>
                <span className="hp-summary-label">Your selection</span>
                <div className="hp-summary-stalls">
                  {selected.map((id) => (
                    <b key={id}>{id}</b>
                  ))}
                </div>
              </div>
              <div className="hp-summary-total">
                <strong>{selected.length * 9} sqm</strong>
                <span>
                  {selected.length} stall{selected.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <fieldset className="hp-section">
              <legend>
                <i>1</i> Organisation
              </legend>
              <div className="hp-fields">
                {field("company", "Company / organisation", {
                  wide: true,
                  maxLength: 120,
                  autoComplete: "organization",
                  placeholder: "Registered name, as it should appear on the invoice",
                })}
                {field("gstNumber", "GST number", {
                  wide: true,
                  maxLength: 15,
                  autoCapitalize: "characters",
                  placeholder: "07AAACI1234F1Z5",
                  hint: "15 characters, as printed on your GST certificate.",
                  transform: (value) => value.toUpperCase().replace(/\s/g, ""),
                })}
              </div>
            </fieldset>

            <fieldset className="hp-section">
              <legend>
                <i>2</i> Contact person
              </legend>
              <div className="hp-fields">
                {field("contact", "Full name", {
                  wide: true,
                  maxLength: 120,
                  autoComplete: "name",
                })}
                {field("email", "Email", {
                  type: "email",
                  maxLength: 160,
                  autoComplete: "email",
                  inputMode: "email",
                  placeholder: "name@company.com",
                  hint: "Your confirmation is sent here.",
                })}
                {field("phone", "WhatsApp number", {
                  type: "tel",
                  maxLength: 40,
                  autoComplete: "tel",
                  inputMode: "tel",
                  placeholder: "+91 98765 43210",
                })}
              </div>
            </fieldset>

            <fieldset className="hp-section">
              <legend>
                <i>3</i> Billing address
              </legend>
              <div className="hp-fields">
                {field("address", "Address", {
                  wide: true,
                  maxLength: 240,
                  autoComplete: "street-address",
                  placeholder: "Building, street, area",
                })}
                {field("city", "City", {
                  maxLength: 80,
                  autoComplete: "address-level2",
                })}
                {field("state", "State", {
                  maxLength: 80,
                  autoComplete: "address-level1",
                  list: "hp-states",
                })}
                <datalist id="hp-states">
                  {INDIAN_STATES.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
            </fieldset>

            <fieldset className="hp-section">
              <legend>
                <i>4</i> Anything else <small>optional</small>
              </legend>
              <label className="hp-field">
                <span className="hp-sr">Anything we should know</span>
                <textarea
                  name="note"
                  rows={3}
                  maxLength={500}
                  placeholder="Preferred neighbours, power needs, questions for the team…"
                  value={form.note}
                  onChange={(event) =>
                    setForm({ ...form, note: event.target.value })
                  }
                />
              </label>
            </fieldset>

            {feedback?.kind === "error" ? (
              <p className="hp-feedback is-error" role="alert">
                {feedback.message}
              </p>
            ) : null}

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
          </div>
        ) : null}
      </footer>
    </div>
  );
}
