/** Shapes shared by the organiser desk UI and `/api/admin/bookings`. No server-only imports. */

export const PAYMENT_STATUSES = ["pending", "partial", "paid", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  partial: "Partially paid",
  paid: "Paid",
  refunded: "Refunded",
};

export const isPaymentStatus = (value: unknown): value is PaymentStatus =>
  typeof value === "string" && (PAYMENT_STATUSES as readonly string[]).includes(value);

export type Booking = {
  stall_id: string;
  status: "hold" | "booked";
  company: string | null;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  gst_number: string | null;
  note: string | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  requested_at: string | null;
  updated_at: string;
};

/** The organisation fields an organiser may edit, with their length caps. */
export const DETAIL_FIELDS = {
  company: 120,
  contact: 120,
  email: 160,
  phone: 40,
  address: 240,
  city: 80,
  state: 80,
  gst_number: 30,
  note: 500,
} as const;
export type DetailField = keyof typeof DETAIL_FIELDS;
export type BookingDetails = Record<DetailField, string>;

export type BookingGroup = {
  key: string;
  /** Most recently updated row first; its details represent the organisation. */
  rows: Booking[];
  lead: Booking;
  stallIds: string[];
  holds: number;
  booked: number;
  /** Null when the organisation's stalls disagree on payment status. */
  payment: PaymentStatus | null;
};

const companyKey = (company: string | null) =>
  (company ?? "").trim().toLowerCase().replace(/\s+/g, " ");

/**
 * One group per organisation, matched on company name ignoring case and
 * spacing. Rows without a company name stay as their own entries.
 */
export function groupBookings(bookings: Booking[]): BookingGroup[] {
  const groups = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const name = companyKey(booking.company);
    const key = name ? `org:${name}` : `stall:${booking.stall_id}`;
    const rows = groups.get(key);
    if (rows) rows.push(booking);
    else groups.set(key, [booking]);
  }
  return [...groups.entries()].map(([key, rows]) => {
    const payments = new Set(rows.map((row) => row.payment_status));
    return {
      key,
      rows,
      lead: rows[0],
      stallIds: rows
        .map((row) => row.stall_id)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      holds: rows.filter((row) => row.status === "hold").length,
      booked: rows.filter((row) => row.status === "booked").length,
      payment: payments.size === 1 ? rows[0].payment_status : null,
    };
  });
}
