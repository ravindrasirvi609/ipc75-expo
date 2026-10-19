import { EVENT } from "./expo-content";

/**
 * The acceptance email every author receives (wording supplied by the
 * Scientific Services Committee). Edit the text here; the PDF letter reuses
 * the same paragraphs. One email is sent per saved record.
 */

export type AuthorEmailData = {
  author_name: string;
  paper_code: string | null;
  poster_code: string | null;
  title: string;
};

export const SUBJECT = `Acceptance of Abstract – ${EVENT.parent}`;

/** Registration + declaration form linked from the email. */
export const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf0nKOVhhX65WkmxOuTZnC4f5yBnk7UwAiXCzmFXGKG16zdiQ/viewform?usp=sharing&ouid=112884967047847445061";

/** The logo is attached inline and referenced from the HTML as cid:<this>. */
export const LOGO_CID = "ipc-logo";

export const COMMITTEE = "Scientific Services Committee";

export const INTRO = `We are delighted to inform you that your abstract submitted to the Scientific IPCA Portal for the ${EVENT.parent} (${EVENT.milestone} Edition) has been accepted for presentation. The congress will be hosted by the Indian Pharmacy Graduates' Association at Yashobhoomi, Dwarka, New Delhi, from 18–20 December 2026.`;

export const REGISTRATION =
  "Kindly complete your registration at the earliest and share the registration details through the Google Form linked in this email. Please note that poster presentation slots will be scheduled on a first-come, first-served basis, following receipt of your registration confirmation.";

export const DETAILS_LEAD = "The abstract details are:";
export const FORM_LEAD =
  "Please fill the Google Form for the declaration and Registration Confirmation by clicking the link:";
export const CLOSING = "We look forward to your active participation in this landmark event.";

/** The code/title rows, leaving out a code the author doesn't have. */
export function abstractDetails(a: AuthorEmailData): [string, string][] {
  const rows: [string, string][] = [];
  if (a.paper_code) rows.push(["Paper Code", a.paper_code]);
  if (a.poster_code) rows.push(["Poster Code", a.poster_code]);
  rows.push(["Title", a.title]);
  return rows;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function buildAuthorEmail(author: AuthorEmailData) {
  const details = abstractDetails(author);

  const text = [
    `Dear ${author.author_name},`,
    "",
    INTRO,
    "",
    REGISTRATION,
    "",
    DETAILS_LEAD,
    "",
    ...details.flatMap(([label, value]) => [`${label}: ${value}`, ""]),
    `${FORM_LEAD} ${GOOGLE_FORM_URL}`,
    "",
    CLOSING,
    "",
    "Warm regards,",
    COMMITTEE,
    EVENT.parent,
    "",
    "Your acceptance letter is attached as a PDF.",
  ].join("\n");

  const p = (content: string) => `<p style="margin:0 0 16px">${content}</p>`;
  const html = `<div style="max-width:640px;margin:0 auto;font-family:Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#0e1b33">
<p style="margin:0 0 20px"><img src="cid:${LOGO_CID}" width="450" alt="${escapeHtml(EVENT.parent)} — ${escapeHtml(EVENT.milestone)}" style="display:block;width:100%;max-width:450px;height:auto;border:0"></p>
${p(`Dear ${escapeHtml(author.author_name)},`)}
${p(escapeHtml(INTRO))}
${p(escapeHtml(REGISTRATION))}
${p(escapeHtml(DETAILS_LEAD))}
<table role="presentation" style="border-collapse:collapse;margin:0 0 16px">
${details
  .map(
    ([label, value]) =>
      `<tr><td style="padding:4px 16px 4px 0;vertical-align:top;white-space:nowrap">${escapeHtml(label)}:</td><td style="padding:4px 0"><strong>${escapeHtml(value)}</strong></td></tr>`,
  )
  .join("\n")}
</table>
${p(`${escapeHtml(FORM_LEAD)} <a href="${escapeHtml(GOOGLE_FORM_URL)}">Registration &amp; declaration form</a>`)}
${p(escapeHtml(CLOSING))}
<p style="margin:0">Warm regards,<br>${escapeHtml(COMMITTEE)}<br>${escapeHtml(EVENT.parent)}</p>
</div>`;

  return { subject: SUBJECT, text, html };
}
