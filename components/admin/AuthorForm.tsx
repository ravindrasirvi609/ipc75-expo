"use client";

import { useState } from "react";
import { validateAuthor, type SaveResult } from "@/lib/authors";

const EMPTY = {
  serialNo: "",
  authorName: "",
  paperCode: "",
  posterCode: "",
  email: "",
  title: "",
};

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "done"; name: string }
  | { kind: "error"; message: string };

/** The normal, one-author-at-a-time form. */
export default function AuthorForm({
  save,
}: {
  save: (rows: unknown[]) => Promise<SaveResult>;
}) {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const set =
    (field: keyof typeof EMPTY) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      if (status.kind !== "saving") setStatus({ kind: "idle" });
    };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status.kind === "saving") return;

    const check = validateAuthor(values);
    if (!check.ok) return setStatus({ kind: "error", message: check.message });

    setStatus({ kind: "saving" });
    const result = await save([check.value]);
    if (result.inserted > 0) {
      setValues(EMPTY);
      setStatus({ kind: "done", name: check.value.authorName });
    } else {
      setStatus({
        kind: "error",
        message:
          result.message ?? result.rejected[0]?.message ?? "Could not save.",
      });
    }
  };

  return (
    <form className="authors-form" onSubmit={submit} noValidate>
      <div className="authors-grid">
        <label className="authors-field authors-field-narrow">
          S. No.
          <input
            inputMode="numeric"
            maxLength={9}
            value={values.serialNo}
            onChange={set("serialNo")}
            placeholder="Auto"
          />
        </label>
        <label className="authors-field authors-field-wide">
          Author name
          <input
            required
            maxLength={160}
            value={values.authorName}
            onChange={set("authorName")}
          />
        </label>
        <label className="authors-field">
          Paper code
          <input
            maxLength={40}
            value={values.paperCode}
            onChange={set("paperCode")}
          />
        </label>
        <label className="authors-field">
          Poster code
          <input
            maxLength={40}
            value={values.posterCode}
            onChange={set("posterCode")}
          />
        </label>
        <label className="authors-field authors-field-wide">
          Email
          <input
            required
            type="email"
            maxLength={160}
            value={values.email}
            onChange={set("email")}
          />
        </label>
        <label className="authors-field authors-field-full">
          Title
          <textarea
            required
            rows={3}
            maxLength={500}
            value={values.title}
            onChange={set("title")}
          />
        </label>
      </div>
      <p className="authors-hint">
        Give a paper code, a poster code, or both. Leave S. No. blank to
        continue the numbering.
      </p>

      {status.kind === "error" ? (
        <p className="admin-error" role="alert">
          {status.message}
        </p>
      ) : null}
      {status.kind === "done" ? (
        <p className="admin-notice" role="status">
          Saved {status.name}.
        </p>
      ) : null}

      <button
        type="submit"
        className="admin-primary"
        disabled={status.kind === "saving"}
      >
        {status.kind === "saving" ? "Saving…" : "Add author"}
      </button>
    </form>
  );
}
