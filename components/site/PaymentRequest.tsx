"use client";

import { useState } from "react";
import type { BankDetails } from "@/lib/finance";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; bank: BankDetails }
  | { kind: "error"; message: string };

/**
 * Requests the bank account details.
 *
 * They are deliberately not on the page: an account number sitting on an
 * indexable page is what payment-diversion scams are built on. This asks the
 * server for them, which also tells the desk who is about to pay.
 */
export default function PaymentRequest() {
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state.kind === "sending") return;
    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/payment-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, email }),
      });
      const result = await response.json();
      if (response.ok && result.ok) setState({ kind: "done", bank: result.bank });
      else
        setState({
          kind: "error",
          message: result.message ?? "Could not fetch the details.",
        });
    } catch {
      setState({ kind: "error", message: "Network problem — nothing was sent." });
    }
  };

  if (state.kind === "done") {
    const { bank } = state;
    return (
      <div className="pay-reveal" role="status">
        <p className="eyebrow">Bank details</p>
        <dl>
          <div>
            <dt className="data-label">Bank</dt>
            <dd>{bank.bank}</dd>
          </div>
          <div>
            <dt className="data-label">Favouring</dt>
            <dd>{bank.favouring}</dd>
          </div>
          <div>
            <dt className="data-label">Account number</dt>
            <dd>{bank.account}</dd>
          </div>
          <div>
            <dt className="data-label">IFSC</dt>
            <dd>{bank.ifsc}</dd>
          </div>
          <div>
            <dt className="data-label">Branch</dt>
            <dd>{bank.branch}</dd>
          </div>
        </dl>
        <p className="pay-verify">
          Verify these against the invoice the exhibition desk sends you before
          you transfer. If a figure differs anywhere, call the desk — do not pay.
        </p>
      </div>
    );
  }

  return (
    <form className="pay-form" onSubmit={submit}>
      <p className="eyebrow">Bank details</p>
      <p className="pay-form-lede">
        Account number and IFSC are sent on request rather than published, so
        nobody can clone this page with their own account on it.
      </p>
      <label>
        Company
        <input
          required
          maxLength={120}
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </label>
      <label>
        Email
        <input
          required
          type="email"
          maxLength={160}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      {state.kind === "error" ? (
        <p className="pay-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={state.kind === "sending"}
      >
        {state.kind === "sending" ? "Fetching…" : "Show bank details"}
      </button>
    </form>
  );
}
