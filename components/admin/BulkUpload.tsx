"use client";

import { useMemo, useState } from "react";
import {
  MAX_BULK_ROWS,
  TEMPLATE_CSV,
  parseAuthorCsv,
  validateAuthor,
  type AuthorInput,
  type BulkParse,
  type SaveResult,
} from "@/lib/authors";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const SHOWN = 8;

type Outcome = {
  inserted: number;
  message?: string;
  rejected: { line: number; message: string }[];
};

const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(`﻿${TEMPLATE_CSV}`)}`;

/** CSV bulk upload: pick a file, review what will happen, then confirm. */
export default function BulkUpload({
  save,
}: {
  save: (rows: unknown[]) => Promise<SaveResult>;
}) {
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<BulkParse | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  // Remounts the file input so the same file can be chosen again after a fix.
  const [pickerKey, setPickerKey] = useState(0);

  const review = useMemo(() => {
    if (!parsed?.ok) return null;
    const ready: { line: number; value: AuthorInput }[] = [];
    const problems: { line: number; message: string }[] = [];
    for (const { line, raw } of parsed.rows) {
      const check = validateAuthor(raw);
      if (check.ok) ready.push({ line, value: check.value });
      else problems.push({ line, message: check.message });
    }
    return { ready, problems };
  }, [parsed]);

  const choose = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setOutcome(null);
    if (!file) {
      setFileName("");
      setParsed(null);
      return;
    }
    setFileName(file.name);
    if (file.size > MAX_FILE_BYTES) {
      setParsed({ ok: false, message: "That file is over 2 MB." });
      return;
    }
    setParsed(parseAuthorCsv(await file.text()));
  };

  const tooMany = (review?.ready.length ?? 0) > MAX_BULK_ROWS;

  const upload = async () => {
    if (!review || busy || tooMany || review.ready.length === 0) return;
    setBusy(true);
    const result = await save(review.ready.map((r) => r.value));
    setBusy(false);
    setOutcome({
      inserted: result.inserted,
      message: result.inserted === 0 ? result.message : undefined,
      rejected: result.rejected.map(({ index, message }) => ({
        line: review.ready[index]?.line ?? 0,
        message,
      })),
    });
    // Saved rows must not be uploaded twice; leftovers need a corrected file.
    if (result.inserted > 0) {
      setParsed(null);
      setFileName("");
      setPickerKey((key) => key + 1);
    }
  };

  return (
    <div className="authors-bulk">
      <p className="authors-hint">
        Upload a <strong>.csv</strong> file with a header row and these
        columns: <em>S. No., Author Name, Paper Code, Poster Code, Email,
        Title</em>. In Excel, use <em>Save As → CSV</em>.{" "}
        <a href={templateHref} download="authors-template.csv">
          Download a template
        </a>
        .
      </p>

      <label className="authors-drop">
        <span>{fileName || "Choose a CSV file"}</span>
        <input
          key={pickerKey}
          type="file"
          accept=".csv,.tsv,.txt,text/csv"
          onChange={choose}
        />
      </label>

      {parsed && !parsed.ok ? (
        <p className="admin-error" role="alert">
          {parsed.message}
        </p>
      ) : null}

      {review ? (
        <div className="authors-review">
          <p className="authors-summary">
            <strong>{review.ready.length}</strong> ready to upload
            {review.problems.length ? (
              <>
                {" · "}
                <strong className="authors-bad">{review.problems.length}</strong>{" "}
                with problems (will be skipped)
              </>
            ) : null}
          </p>

          {tooMany ? (
            <p className="admin-error" role="alert">
              Upload at most {MAX_BULK_ROWS} rows at a time. Split the file and
              upload it in parts.
            </p>
          ) : null}

          {review.problems.length ? (
            <ul className="authors-problems">
              {review.problems.slice(0, 20).map((p) => (
                <li key={p.line}>
                  <span>Line {p.line}</span> {p.message}
                </li>
              ))}
              {review.problems.length > 20 ? (
                <li>…and {review.problems.length - 20} more.</li>
              ) : null}
            </ul>
          ) : null}

          {review.ready.length ? (
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
                  </tr>
                </thead>
                <tbody>
                  {review.ready.slice(0, SHOWN).map(({ line, value }) => (
                    <tr key={line}>
                      <td>{value.serialNo ?? "Auto"}</td>
                      <td>{value.authorName}</td>
                      <td>{value.paperCode || "—"}</td>
                      <td>{value.posterCode || "—"}</td>
                      <td>{value.email}</td>
                      <td>{value.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {review.ready.length > SHOWN ? (
                <p className="authors-hint">
                  Showing the first {SHOWN} of {review.ready.length}.
                </p>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            className="admin-primary"
            disabled={busy || tooMany || review.ready.length === 0}
            onClick={() => void upload()}
          >
            {busy
              ? "Uploading…"
              : `Upload ${review.ready.length} author${review.ready.length === 1 ? "" : "s"}`}
          </button>
        </div>
      ) : null}

      {outcome ? (
        <div className="authors-outcome" role="status">
          {outcome.inserted > 0 ? (
            <p className="admin-notice">
              Saved {outcome.inserted} author{outcome.inserted === 1 ? "" : "s"}.
            </p>
          ) : (
            <p className="admin-error" role="alert">
              {outcome.message ?? "Nothing was saved."}
            </p>
          )}
          {outcome.rejected.length ? (
            <>
              <p className="authors-hint">
                {outcome.rejected.length} row
                {outcome.rejected.length === 1 ? " was" : "s were"} not saved:
              </p>
              <ul className="authors-problems">
                {outcome.rejected.slice(0, 20).map((r, i) => (
                  <li key={i}>
                    <span>Line {r.line}</span> {r.message}
                  </li>
                ))}
                {outcome.rejected.length > 20 ? (
                  <li>…and {outcome.rejected.length - 20} more.</li>
                ) : null}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
