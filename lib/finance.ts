/**
 * Payment details, split by what is safe to publish.
 *
 * Server-only. `PUBLIC_FINANCE` may be rendered anywhere. `BANK_DETAILS` must
 * never reach an SSR page or the client bundle — it is returned exclusively by
 * `POST /api/payment-details`, so the account number is not on an indexable
 * page that a fraudster can clone with their own account substituted.
 *
 * To keep the numbers out of the repository entirely, set IPC_BANK_ACCOUNT and
 * IPC_BANK_IFSC in the environment; those win over the values here.
 *
 * There is no `server-only` guard because that package is not a dependency here.
 * The boundary is held by convention: `getBankDetails` is imported by exactly
 * one file, the route handler that gates it. Keep it that way.
 */

/** Verification identifiers. Publishing these helps exhibitors check you out. */
export const PUBLIC_FINANCE = {
  payee: "75th IPC a/c IPGA",
  payableAt: "New Delhi",
  instruments: ["Cheque", "Demand Draft", "RTGS", "NEFT"],
  pan: "AAATT7705P",
  gst: "07AAATT7705P2ZW",
  csr: "CSR00110215",
} as const;

export type BankDetails = {
  bank: string;
  favouring: string;
  account: string;
  ifsc: string;
  branch: string;
};

const FALLBACK: BankDetails = {
  bank: "HDFC Bank Ltd",
  favouring: "75th IPC a/c IPGA",
  account: "50100876687745",
  ifsc: "HDFC0004364",
  branch: "Dwarka Sec-10, New Delhi – 110075",
};

/** Never call this from a page or a client component. */
export function getBankDetails(): BankDetails {
  return {
    ...FALLBACK,
    account: process.env.IPC_BANK_ACCOUNT ?? FALLBACK.account,
    ifsc: process.env.IPC_BANK_IFSC ?? FALLBACK.ifsc,
  };
}
