"use client";

import { useState } from "react";
import {
  DETAIL_FIELDS,
  PAYMENT_LABELS,
  PAYMENT_STATUSES,
  type BookingDetails,
  type BookingGroup,
  type DetailField,
  type PaymentStatus,
} from "@/lib/booking-admin";

export type BookingChange =
  | { status: "booked" | "hold" }
  | { action: "release" }
  | { paymentStatus: PaymentStatus; paymentReference: string }
  | { details: BookingDetails };

type Props = {
  group: BookingGroup;
  busy: boolean;
  paymentTracking: boolean;
  /** Resolves true when the change was saved. */
  onChange: (
    stallIds: string[],
    change: BookingChange,
    done: string,
  ) => Promise<boolean>;
};

const FIELD_LABELS: Record<DetailField, string> = {
  company: "Company / organisation",
  contact: "Contact name",
  email: "Email",
  phone: "WhatsApp number",
  address: "Address",
  city: "City",
  state: "State",
  gst_number: "GST number",
  note: "Note",
};

const detailsOf = (group: BookingGroup): BookingDetails => {
  const details = {} as BookingDetails;
  for (const field of Object.keys(DETAIL_FIELDS) as DetailField[])
    details[field] = group.lead[field] ?? "";
  return details;
};

export default function BookingCard({
  group,
  busy,
  paymentTracking,
  onChange,
}: Props) {
  const { lead, stallIds, holds, booked } = group;
  const name = lead.company ?? "Unnamed company";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BookingDetails>(() => detailsOf(group));
  const [payment, setPayment] = useState<PaymentStatus>(
    group.payment ?? lead.payment_status,
  );
  const [reference, setReference] = useState(lead.payment_reference ?? "");

  const holdIds = group.rows
    .filter((row) => row.status === "hold")
    .map((row) => row.stall_id);
  const paymentDirty =
    payment !== group.payment || reference !== (lead.payment_reference ?? "");
  const location = [lead.address, lead.city, lead.state]
    .filter(Boolean)
    .join(", ");

  async function saveDetails(event: React.FormEvent) {
    event.preventDefault();
    if (await onChange(stallIds, { details: draft }, `${draft.company.trim() || name} updated.`))
      setEditing(false);
  }

  return (
    <article className="org-card">
      <header className="org-head">
        <div>
          <h3>{name}</h3>
          <p>
            {stallIds.length} stall{stallIds.length === 1 ? "" : "s"} ·{" "}
            {stallIds.length * 9} sqm
          </p>
        </div>
        <div className="org-badges">
          {holds > 0 && (
            <span className="org-badge hold">
              {booked > 0 ? `${holds} on hold` : "On hold"}
            </span>
          )}
          {booked > 0 && (
            <span className="org-badge booked">
              {holds > 0 ? `${booked} booked` : "Booked"}
            </span>
          )}
          {paymentTracking && (
            <span className={`org-badge pay-${group.payment ?? "mixed"}`}>
              {group.payment ? PAYMENT_LABELS[group.payment] : "Payment mixed"}
            </span>
          )}
        </div>
      </header>

      <ul className="org-stalls" aria-label={`Stalls for ${name}`}>
        {group.rows
          .slice()
          .sort((a, b) =>
            a.stall_id.localeCompare(b.stall_id, undefined, { numeric: true }),
          )
          .map((row) => (
            <li key={row.stall_id} className={`org-stall ${row.status}`}>
              <strong>{row.stall_id}</strong>
              <span>{row.status}</span>
              {row.status === "hold" && stallIds.length > 1 && (
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Release ${row.stall_id}`}
                  title={`Release ${row.stall_id}`}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Release ${row.stall_id} and make it available again?`,
                      )
                    )
                      void onChange(
                        [row.stall_id],
                        { action: "release" },
                        `${row.stall_id} is available again.`,
                      );
                  }}
                >
                  ×
                </button>
              )}
            </li>
          ))}
      </ul>

      {editing ? (
        <form className="org-edit" onSubmit={saveDetails}>
          {(Object.keys(DETAIL_FIELDS) as DetailField[]).map((field) => (
            <label
              key={field}
              className={
                field === "address" || field === "note" || field === "company"
                  ? "org-wide"
                  : undefined
              }
            >
              {FIELD_LABELS[field]}
              {field === "note" ? (
                <textarea
                  rows={2}
                  maxLength={DETAIL_FIELDS[field]}
                  value={draft[field]}
                  onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
                />
              ) : (
                <input
                  type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                  required={field === "company"}
                  maxLength={DETAIL_FIELDS[field]}
                  value={draft[field]}
                  onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
                />
              )}
            </label>
          ))}
          <p className="org-edit-hint org-wide">
            Saved to all {stallIds.length} stall{stallIds.length === 1 ? "" : "s"}.
            The company name is shown publicly on the floor plan.
          </p>
          <div className="org-edit-actions org-wide">
            <button className="admin-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="org-secondary"
              disabled={busy}
              onClick={() => {
                setDraft(detailsOf(group));
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <dl className="org-details">
          <div>
            <dt>Contact</dt>
            <dd>{lead.contact ?? "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}
            </dd>
          </div>
          <div>
            <dt>WhatsApp</dt>
            <dd>{lead.phone ?? "—"}</dd>
          </div>
          <div>
            <dt>GST</dt>
            <dd>{lead.gst_number ?? "—"}</dd>
          </div>
          <div className="org-wide">
            <dt>Address</dt>
            <dd>{location || "—"}</dd>
          </div>
          {lead.note && (
            <div className="org-wide">
              <dt>Note</dt>
              <dd>{lead.note}</dd>
            </div>
          )}
        </dl>
      )}

      <footer className="org-foot">
        {paymentTracking && (
          <div className="org-payment">
            <label>
              Payment
              <select
                value={payment}
                disabled={busy}
                onChange={(e) => setPayment(e.target.value as PaymentStatus)}
              >
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PAYMENT_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Reference
              <input
                placeholder="UTR / cheque no."
                maxLength={120}
                value={reference}
                disabled={busy}
                onChange={(e) => setReference(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="org-secondary"
              disabled={busy || !paymentDirty}
              onClick={() =>
                void onChange(
                  stallIds,
                  { paymentStatus: payment, paymentReference: reference },
                  `${name}: ${PAYMENT_LABELS[payment].toLowerCase()}.`,
                )
              }
            >
              Save payment
            </button>
          </div>
        )}
        <div className="booking-action">
          {!editing && (
            <button
              type="button"
              className="release-button"
              disabled={busy}
              onClick={() => {
                setDraft(detailsOf(group));
                setEditing(true);
              }}
            >
              Edit details
            </button>
          )}
          {holds > 0 && (
            <button
              type="button"
              className="release-button"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    `Release ${holdIds.join(", ")} and make ${holdIds.length === 1 ? "it" : "them"} available again?`,
                  )
                )
                  void onChange(
                    holdIds,
                    { action: "release" },
                    `${holdIds.join(", ")} released.`,
                  );
              }}
            >
              Release hold{holdIds.length === 1 ? "" : "s"}
            </button>
          )}
          {holds > 0 ? (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void onChange(
                  holdIds,
                  { status: "booked" },
                  `${name}: ${holdIds.join(", ")} confirmed.`,
                )
              }
            >
              {busy ? "Updating…" : "Confirm booking"}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void onChange(
                  stallIds,
                  { status: "hold" },
                  `${name}: returned to hold.`,
                )
              }
            >
              {busy ? "Updating…" : "Return to hold"}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
