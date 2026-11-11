"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import BookingCard, { type BookingChange } from "@/components/admin/BookingCard";
import { groupBookings, type Booking } from "@/lib/booking-admin";
import "./admin.css";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null), [email, setEmail] = useState(""), [password, setPassword] = useState(""), [bookings, setBookings] = useState<Booking[]>([]), [message, setMessage] = useState(""), [loading, setLoading] = useState(true), [busy, setBusy] = useState(""), [paymentTracking, setPaymentTracking] = useState(true);
  async function load() { setLoading(true); const { data: session } = await supabaseBrowser.auth.getSession(); setUser(session.session?.user ?? null); if (!session.session) return setLoading(false); const response = await fetch("/api/admin/bookings", { headers: { Authorization: `Bearer ${session.session.access_token}` }, cache: "no-store" }); const data = await response.json(); if (!response.ok) setMessage(data.message ?? "Access denied."); else { setBookings(data.bookings ?? []); setPaymentTracking(data.paymentTracking !== false); } setLoading(false); }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);
  async function signIn(event: React.FormEvent) { event.preventDefault(); setMessage(""); setLoading(true); const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password }); if (error) { setMessage(error.message); setLoading(false); return; } await load(); }
  async function change(key: string, stallIds: string[], body: BookingChange, done: string) {
    setBusy(key); setMessage("");
    let ok = false;
    try {
      const { data } = await supabaseBrowser.auth.getSession();
      const response = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ stallIds, ...body }) });
      ok = response.ok;
      setMessage(ok ? done : (await response.json().catch(() => ({}))).message ?? "Could not update booking.");
    } catch { setMessage("Network problem — the change was not saved."); }
    setBusy(""); await load();
    return ok;
  }
  const holds = useMemo(() => bookings.filter((b) => b.status === "hold"), [bookings]), confirmed = useMemo(() => bookings.filter((b) => b.status === "booked"), [bookings]), groups = useMemo(() => groupBookings(bookings), [bookings]);
  if (!user) return <main className="admin-login"><section className="login-panel"><div className="admin-mark">75<span>IPC</span></div><p className="admin-kicker">Exhibition operations</p><h1>Welcome back.</h1><p className="admin-intro">Sign in to review stall requests and keep the Hall 1C booking desk current.</p><form onSubmit={signIn}><label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label><button className="admin-primary" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in to desk"}</button></form>{message && <p className="admin-error">{message}</p>}</section><aside className="login-aside"><p className="admin-kicker">75th IPC PharmaExpo</p><h2>The floor, kept moving.</h2></aside></main>;
  return <main className="admin-app"><header className="admin-top"><div className="admin-brand"><div className="admin-mark">75<span>IPC</span></div><div><p className="admin-kicker">Organiser desk</p><strong>Hall 1C operations</strong></div></div><div className="admin-account"><Link href="/admin/authors">Authors</Link><span>{user.email}</span><button onClick={() => void supabaseBrowser.auth.signOut().then(() => setUser(null))}>Sign out</button></div></header><section className="admin-content"><div className="admin-title"><div><p className="admin-kicker">Live booking control</p><h1>Stall requests</h1><p>Review provisional holds and confirm the exhibitors ready for the floor.</p></div><button className="refresh" onClick={() => void load()}>↻ Refresh</button></div><div className="admin-stats"><div><span>Awaiting review</span><strong>{holds.length}</strong><small>stalls on hold</small></div><div><span>Confirmed</span><strong>{confirmed.length}</strong><small>booked stalls</small></div><div><span>Organisations</span><strong>{groups.length}</strong><small>{bookings.length} stalls in desk</small></div></div>{!paymentTracking && <p className="admin-error">Payment tracking is off until the database migration 20261111000000_stall_booking_payment.sql is applied in Supabase.</p>}{message && <p className="admin-notice">{message}</p>}<div className="admin-list"><div className="list-heading"><h2>Requests</h2><span>{groups.length} organisation{groups.length === 1 ? "" : "s"} · {bookings.length} stall{bookings.length === 1 ? "" : "s"}</span></div>{loading ? <div className="admin-empty">Loading requests…</div> : bookings.length === 0 ? <div className="admin-empty"><strong>No requests yet</strong></div> : groups.map((group) => <BookingCard key={`${group.key}:${group.rows.map((row) => row.updated_at).join()}`} group={group} busy={busy === group.key} paymentTracking={paymentTracking} onChange={(stallIds, body, done) => change(group.key, stallIds, body, done)} />)}</div></section></main>;
}
