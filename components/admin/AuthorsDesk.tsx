"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { AuthorRow, SaveResult } from "@/lib/authors";
import AuthorForm from "./AuthorForm";
import BulkUpload from "./BulkUpload";
import "@/app/admin/admin.css";
import "./authors.css";

type Tab = "single" | "bulk";
type Phase = "loading" | "signed-out" | "denied" | "ready";

const ENDPOINT = "/api/admin/authors";

/** Organiser desk for paper and poster authors: add one, or upload many. */
export default function AuthorsDesk() {
  const [user, setUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("single");
  const [query, setQuery] = useState("");
  const [removing, setRemoving] = useState("");
  const [pending, setPending] = useState(0);
  const [mailing, setMailing] = useState(false);
  const [mailProgress, setMailProgress] = useState<
    { done: number; of: number } | null
  >(null);
  const [mailResult, setMailResult] = useState<
    { ok: boolean; text: string; errors: string[] } | null
  >(null);

  const accessToken = async () =>
    (await supabaseBrowser.auth.getSession()).data.session?.access_token;

  const load = useCallback(async () => {
    const { data } = await supabaseBrowser.auth.getSession();
    const session = data.session;
    setUser(session?.user ?? null);
    if (!session) return setPhase("signed-out");

    try {
      const response = await fetch(ENDPOINT, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.message ?? "Could not load authors.");
        return setPhase(response.status === 401 ? "denied" : "ready");
      }
      setAuthors(body.authors ?? []);
      setTotal(body.total ?? 0);
      setPending(body.pending ?? 0);
      setError("");
      setPhase("ready");
    } catch {
      setError("Network problem — could not load authors.");
      setPhase("ready");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const save = async (rows: unknown[]): Promise<SaveResult> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await accessToken()}`,
        },
        body: JSON.stringify({ rows }),
      });
      const body = await response.json().catch(() => ({}));
      const result: SaveResult = {
        ok: Boolean(body.ok),
        inserted: body.inserted ?? 0,
        rejected: body.rejected ?? [],
        message: body.message,
      };
      if (result.inserted > 0) await load();
      return result;
    } catch {
      return {
        ok: false,
        inserted: 0,
        rejected: [],
        message: "Network problem — nothing was saved.",
      };
    }
  };

  const remove = async (author: AuthorRow) => {
    if (!window.confirm(`Delete ${author.author_name}?`)) return;
    setRemoving(author.id);
    setError("");
    try {
      const response = await fetch(`${ENDPOINT}?id=${author.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${await accessToken()}` },
      });
      if (!response.ok)
        setError(
          (await response.json().catch(() => ({}))).message ??
            "Could not delete.",
        );
      else await load();
    } catch {
      setError("Network problem — nothing was deleted.");
    }
    setRemoving("");
  };

  /**
   * One click emails every author who hasn't had it yet. If everyone already
   * has, the same button offers to send to all again.
   */
  const sendAll = async () => {
    if (mailing || total === 0) return;
    const resend = pending === 0;
    const count = resend ? total : pending;
    const question = resend
      ? `Every author has already been emailed. Send the acceptance email again to all ${total} record${total === 1 ? "" : "s"}?`
      : `Send the acceptance email, with its PDF letter, to ${count} author${count === 1 ? "" : "s"}? This cannot be undone.`;
    if (!window.confirm(question)) return;

    setMailing(true);
    setMailResult(null);
    setMailProgress({ done: 0, of: count });

    // The server sends a few at a time (each email carries its own PDF); keep
    // asking until none remain. `since` is issued by the server on round one.
    let since: string | undefined;
    let sent = 0;
    let failed = 0;
    let stopped = "";
    const errors: string[] = [];

    try {
      for (;;) {
        const response = await fetch(`${ENDPOINT}/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await accessToken()}`,
          },
          body: JSON.stringify({ resend, since }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          stopped = body.message ?? "Could not send the emails.";
          break;
        }
        since = body.since;
        sent += body.sent ?? 0;
        failed += body.failed ?? 0;
        for (const e of body.errors ?? []) if (errors.length < 10) errors.push(e);
        setMailProgress({ done: sent + failed, of: Math.max(count, sent + failed) });
        if (body.aborted) {
          stopped = body.aborted;
          break;
        }
        if (!body.remaining || !body.processed) break;
      }
    } catch {
      stopped =
        "Network problem — check the list below before trying again, some emails may have been sent.";
    }

    const parts = [`Sent ${sent} email${sent === 1 ? "" : "s"}`];
    if (failed) parts.push(`${failed} failed`);
    setMailResult({
      ok: !stopped && failed === 0,
      text: `${parts.join("; ")}.${stopped ? ` Stopped: ${stopped}` : ""}`,
      errors,
    });
    setMailing(false);
    setMailProgress(null);
    await load();
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return authors;
    return authors.filter((a) =>
      [a.author_name, a.paper_code, a.poster_code, a.email, a.title]
        .join("\n")
        .toLowerCase()
        .includes(needle),
    );
  }, [authors, query]);

  if (phase === "loading")
    return (
      <main className="admin-app">
        <div className="admin-empty">Loading…</div>
      </main>
    );

  if (phase === "signed-out" || phase === "denied")
    return (
      <main className="admin-app">
        <section className="admin-content">
          <p className="admin-kicker">Organiser desk</p>
          <h1 className="authors-h1">
            {phase === "denied" ? "Organiser access required" : "Sign in first"}
          </h1>
          <p className="authors-hint">
            {phase === "denied"
              ? `${user?.email ?? "This account"} is not on the organiser list.`
              : "Sign in on the organiser desk, then come back to this page."}
          </p>
          <Link href="/admin" className="admin-primary authors-link-button">
            Go to organiser desk
          </Link>
        </section>
      </main>
    );

  return (
    <main className="admin-app">
      <header className="admin-top">
        <div className="admin-brand">
          <div className="admin-mark">
            75<span>IPC</span>
          </div>
          <div>
            <p className="admin-kicker">Organiser desk</p>
            <strong>Authors</strong>
          </div>
        </div>
        <div className="admin-account">
          <Link href="/admin">Stall requests</Link>
          <span>{user?.email}</span>
          <button
            onClick={() =>
              void supabaseBrowser.auth.signOut().then(() => {
                setUser(null);
                setPhase("signed-out");
              })
            }
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-title">
          <div>
            <p className="admin-kicker">Papers &amp; posters</p>
            <h1>Authors</h1>
            <p>Add an author by hand, or upload a whole list at once.</p>
          </div>
        </div>

        <div className="authors-panel">
          <div className="authors-tabs" role="tablist" aria-label="Add authors">
            {(
              [
                ["single", "Add one author"],
                ["bulk", "Bulk upload"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={tab === id}
                className={tab === id ? "is-active" : undefined}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div role="tabpanel">
            {tab === "single" ? (
              <AuthorForm save={save} />
            ) : (
              <BulkUpload save={save} />
            )}
          </div>
        </div>

        <div className="list-heading authors-list-heading">
          <h2>Saved authors</h2>
          <span>
            {total} record{total === 1 ? "" : "s"}
          </span>
        </div>
        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="authors-mail">
          <button
            type="button"
            className="admin-primary"
            disabled={mailing || total === 0}
            onClick={() => void sendAll()}
          >
            {mailing
              ? `Sending… ${mailProgress?.done ?? 0} of ${mailProgress?.of ?? "…"}`
              : pending === 0 && total > 0
                ? `Email all again (${total})`
                : `Email all authors (${pending})`}
          </button>
          <span className="authors-hint">
            {pending === 0 && total > 0
              ? "Everyone has been emailed."
              : `${pending} not emailed yet.`}
          </span>
        </div>
        {mailResult ? (
          <div role="status">
            <p className={mailResult.ok ? "admin-notice" : "admin-error"}>
              {mailResult.text}
            </p>
            {mailResult.errors.length ? (
              <ul className="authors-problems">
                {mailResult.errors.map((message, i) => (
                  <li key={i}>{message}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        <input
          className="authors-search"
          type="search"
          placeholder="Search name, code, email or title"
          aria-label="Search authors"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {authors.length === 0 ? (
          <div className="admin-empty">
            <strong>No authors yet</strong>
          </div>
        ) : (
          <div className="authors-table-wrap">
            <table className="authors-table">
              <thead>
                <tr>
                  <th>S. No.</th>
                  <th>Author</th>
                  <th>Paper</th>
                  <th>Poster</th>
                  <th>Email</th>
                  <th>Title</th>
                  <th>Emailed</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((author) => (
                  <tr key={author.id}>
                    <td>{author.serial_no ?? "—"}</td>
                    <td>{author.author_name}</td>
                    <td>{author.paper_code ?? "—"}</td>
                    <td>{author.poster_code ?? "—"}</td>
                    <td>
                      <a href={`mailto:${author.email}`}>{author.email}</a>
                    </td>
                    <td>{author.title}</td>
                    <td
                      className={
                        author.email_error ? "authors-bad" : "authors-sent"
                      }
                      title={author.email_error ?? undefined}
                    >
                      {author.emailed_at
                        ? new Date(author.emailed_at).toLocaleDateString()
                        : author.email_error
                          ? "Failed"
                          : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="authors-delete"
                        disabled={removing === author.id}
                        onClick={() => void remove(author)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 ? (
              <p className="authors-hint">Nothing matches “{query}”.</p>
            ) : null}
            {total > authors.length ? (
              <p className="authors-hint">
                Showing the first {authors.length} of {total}. Use search to
                narrow down.
              </p>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
