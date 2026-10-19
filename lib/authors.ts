/**
 * Author records: shared by the entry form, the CSV bulk upload and the API,
 * so a row is judged by the same rules wherever it comes from. Isomorphic —
 * no server-only imports.
 */

export type AuthorInput = {
  serialNo: number | null;
  authorName: string;
  paperCode: string;
  posterCode: string;
  email: string;
  title: string;
};

export type AuthorRow = {
  id: string;
  serial_no: number | null;
  author_name: string;
  paper_code: string | null;
  poster_code: string | null;
  email: string;
  title: string;
  created_at: string;
  emailed_at: string | null;
  email_error: string | null;
};

export type SaveResult = {
  ok: boolean;
  message?: string;
  inserted: number;
  /** `index` is the position in the `rows` array that was sent. */
  rejected: { index: number; message: string }[];
};

export const MAX_BULK_ROWS = 1000;
export const LIST_LIMIT = 1000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LIMITS = { name: 160, code: 40, email: 160, title: 500 } as const;

const text = (value: unknown) =>
  typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : typeof value === "number"
      ? String(value)
      : "";

/** Normalises and checks one row. Reports every problem, not just the first. */
export function validateAuthor(
  raw: unknown,
): { ok: true; value: AuthorInput } | { ok: false; message: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const problems: string[] = [];

  const authorName = text(r.authorName);
  const paperCode = text(r.paperCode).toUpperCase();
  const posterCode = text(r.posterCode).toUpperCase();
  const email = text(r.email).toLowerCase();
  const title = text(r.title);
  const serialText = text(r.serialNo);

  let serialNo: number | null = null;
  if (serialText) {
    if (/^\d{1,9}$/.test(serialText) && Number(serialText) > 0)
      serialNo = Number(serialText);
    else problems.push("S. No. must be a positive whole number");
  }

  if (!authorName) problems.push("Author name is required");
  else if (authorName.length > LIMITS.name)
    problems.push(`Author name is over ${LIMITS.name} characters`);

  if (!paperCode && !posterCode)
    problems.push("Give a paper code or a poster code");
  if (paperCode.length > LIMITS.code || posterCode.length > LIMITS.code)
    problems.push(`Codes are limited to ${LIMITS.code} characters`);

  if (!email) problems.push("Email is required");
  else if (!EMAIL.test(email) || email.length > LIMITS.email)
    problems.push("Email looks wrong");

  if (!title) problems.push("Title is required");
  else if (title.length > LIMITS.title)
    problems.push(`Title is over ${LIMITS.title} characters`);

  if (problems.length) return { ok: false, message: problems.join("; ") };
  return {
    ok: true,
    value: { serialNo, authorName, paperCode, posterCode, email, title },
  };
}

// ---------------------------------------------------------------- CSV

export const TEMPLATE_HEADER = [
  "S. No.",
  "Author Name",
  "Paper Code",
  "Poster Code",
  "Email",
  "Title",
];

export const TEMPLATE_CSV =
  `${TEMPLATE_HEADER.join(",")}\r\n` +
  `1,Dr. A. Sharma,PP-101,,a.sharma@example.com,"Stability studies of oral dosage forms, a review"\r\n` +
  `2,Dr. R. Iyer,,PS-014,r.iyer@example.com,Green synthesis of nanoparticles\r\n`;

/**
 * RFC 4180-ish CSV reader: quoted cells, doubled quotes, embedded commas and
 * newlines, CRLF or LF, a leading BOM (Excel adds one). The delimiter is
 * sniffed from the header line so a tab- or semicolon-separated export also
 * works. Blank rows are dropped; `line` is the file line a record starts on.
 */
export function parseCsv(input: string): { line: number; cells: string[] }[] {
  const src = input.replace(/^﻿/, "");
  const firstLine = src.split(/\r\n|\r|\n/, 1)[0] ?? "";
  const delimiter = [",", "\t", ";"]
    .map((d) => ({ d, n: firstLine.split(d).length }))
    .sort((a, b) => b.n - a.n)[0].d;

  const records: { line: number; cells: string[] }[] = [];
  let cells: string[] = [];
  let cell = "";
  let quoted = false;
  let line = 1;
  let recordLine = 1;

  const endRecord = () => {
    cells.push(cell);
    cell = "";
    if (cells.some((c) => c.trim() !== "")) records.push({ line: recordLine, cells });
    cells = [];
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else {
        if (ch === "\n") line++;
        cell += ch;
      }
    } else if (ch === '"' && cell === "") {
      quoted = true;
    } else if (ch === delimiter) {
      cells.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      line++;
      endRecord();
      recordLine = line;
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || cells.length) endRecord();
  return records;
}

type Field = keyof AuthorInput;

const HEADER_ALIASES: Record<string, Field> = {
  sno: "serialNo",
  slno: "serialNo",
  serialno: "serialNo",
  serialnumber: "serialNo",
  srno: "serialNo",
  authorname: "authorName",
  author: "authorName",
  name: "authorName",
  papercode: "paperCode",
  paperid: "paperCode",
  postercode: "posterCode",
  posterid: "posterCode",
  email: "email",
  emailid: "email",
  emailaddress: "email",
  title: "title",
  papertitle: "title",
  postertitle: "title",
};

const FIELD_LABEL: Record<Field, string> = {
  serialNo: "S. No.",
  authorName: "Author Name",
  paperCode: "Paper Code",
  posterCode: "Poster Code",
  email: "Email",
  title: "Title",
};

export type BulkParse =
  | { ok: false; message: string }
  | { ok: true; rows: { line: number; raw: Record<Field, string> }[] };

/** Reads a CSV with a header row into raw author rows, matching columns by name. */
export function parseAuthorCsv(input: string): BulkParse {
  const records = parseCsv(input);
  if (records.length === 0) return { ok: false, message: "The file is empty." };

  const columns = records[0].cells.map(
    (h) => HEADER_ALIASES[h.toLowerCase().replace(/[^a-z0-9]/g, "")],
  );
  const missing = (["authorName", "email", "title"] as Field[]).filter(
    (f) => !columns.includes(f),
  );
  if (!columns.includes("paperCode") && !columns.includes("posterCode"))
    missing.push("paperCode");
  if (missing.length)
    return {
      ok: false,
      message: `The first row must be a header. Missing column: ${missing
        .map((f) => FIELD_LABEL[f])
        .join(", ")}.`,
    };

  const rows = records.slice(1).map(({ line, cells }) => {
    const raw: Record<Field, string> = {
      serialNo: "",
      authorName: "",
      paperCode: "",
      posterCode: "",
      email: "",
      title: "",
    };
    columns.forEach((field, i) => {
      if (field && raw[field] === "") raw[field] = cells[i] ?? "";
    });
    return { line, raw };
  });
  if (rows.length === 0)
    return { ok: false, message: "The file has a header but no rows." };
  return { ok: true, rows };
}
