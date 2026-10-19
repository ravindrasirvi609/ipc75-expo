import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readAsset } from "./server-assets";
import {
  CLOSING,
  COMMITTEE,
  DETAILS_LEAD,
  INTRO,
  REGISTRATION,
  abstractDetails,
  type AuthorEmailData,
} from "./author-email";
import { EVENT } from "./expo-content";

/**
 * The personalised "Confirmation of Abstract Acceptance" letter attached to
 * each email. Server-only (reads the logo and fonts from server-assets/).
 *
 * Noto Sans is embedded so Greek letters and symbols common in pharmaceutical
 * titles (α, β, µ, °, ±) print correctly; the standard PDF fonts cannot.
 */

const W = 595.28; // A4
const H = 841.89;
const MARGIN = 54;
const NAVY = rgb(0.1, 0.16, 0.36);
const VALUE = rgb(0.31, 0.35, 0.42);
const ORANGE = rgb(0.74, 0.34, 0.09);
const BODY = 12;
const LEAD = 17.5;

/** Letter date in India, dd-mm-yyyy, as on the committee's sample letter. */
export function letterDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(now)
    .replace(/\//g, "-");
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  let line = "";
  const fits = (s: string) => font.widthOfTextAtSize(s, size) <= width;

  for (const word of text.split(" ").filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (fits(candidate)) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    // A single unbroken string wider than the line (a long code or URL).
    let rest = word;
    while (!fits(rest)) {
      let cut = rest.length - 1;
      while (cut > 1 && !fits(rest.slice(0, cut))) cut--;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    line = rest;
  }
  if (line) lines.push(line);
  return lines;
}

function paintBackground(page: PDFPage) {
  // pdf-lib has no gradients: stack thin strips from pale mint to green.
  const strips = 120;
  const top = [0.94, 0.97, 0.9];
  const bottom = [0.47, 0.72, 0.33];
  const h = H / strips;
  for (let i = 0; i < strips; i++) {
    const t = i / (strips - 1);
    const [r, g, b] = top.map((c, k) => c + (bottom[k] - c) * t);
    page.drawRectangle({
      x: 0,
      y: H - (i + 1) * h - 0.5,
      width: W,
      height: h + 1,
      color: rgb(r, g, b),
    });
  }
}

export async function buildAcceptancePdf(
  author: AuthorEmailData,
  date = letterDate(),
): Promise<Uint8Array> {
  const [regular, bold, logo] = await Promise.all([
    readAsset("fonts/NotoSans-Regular.ttf"),
    readAsset("fonts/NotoSans-Bold.ttf"),
    readAsset("ipc-logo.jpg"),
  ]);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`Confirmation of Abstract Acceptance — ${author.author_name}`);
  pdf.setAuthor(`${COMMITTEE}, ${EVENT.parent}`);
  const font = await pdf.embedFont(regular, { subset: true });
  const strong = await pdf.embedFont(bold, { subset: true });
  const image = await pdf.embedJpg(logo);

  const page = pdf.addPage([W, H]);
  paintBackground(page);

  // Header: gold rule, white band, logo.
  const band = 104;
  page.drawRectangle({ x: 0, y: H - 10, width: W, height: 10, color: rgb(0.83, 0.7, 0.42) });
  page.drawRectangle({ x: 0, y: H - 10 - band, width: W, height: band, color: rgb(1, 1, 1) });
  const logoH = 78;
  const logoW = (image.width / image.height) * logoH;
  page.drawImage(image, {
    x: (W - logoW) / 2,
    y: H - 10 - band + (band - logoH) / 2,
    width: logoW,
    height: logoH,
  });

  const width = W - MARGIN * 2;
  let y = H - 10 - band - 58;

  // Title, shrunk to fit one line.
  const title = "CONFIRMATION OF ABSTRACT ACCEPTANCE";
  let titleSize = 25;
  while (strong.widthOfTextAtSize(title, titleSize) > width && titleSize > 12)
    titleSize -= 0.5;
  page.drawText(title, {
    x: (W - strong.widthOfTextAtSize(title, titleSize)) / 2,
    y,
    size: titleSize,
    font: strong,
    color: ORANGE,
  });

  y -= 44;
  page.drawText(date, {
    x: W - MARGIN - font.widthOfTextAtSize(date, BODY),
    y,
    size: BODY,
    font,
    color: NAVY,
  });

  y -= 36;
  page.drawText("Dear ", { x: MARGIN, y, size: BODY, font, color: NAVY });
  const dearW = font.widthOfTextAtSize("Dear ", BODY);
  const nameLines = wrap(author.author_name, strong, BODY, width - dearW);
  nameLines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN + (i === 0 ? dearW : 0),
      y: y - i * LEAD,
      size: BODY,
      font: strong,
      color: VALUE,
    });
  });
  y -= nameLines.length * LEAD + 12;

  const paragraph = (text: string, gap = 14) => {
    for (const line of wrap(text, font, BODY, width)) {
      page.drawText(line, { x: MARGIN, y, size: BODY, font, color: NAVY });
      y -= LEAD;
    }
    y -= gap;
  };

  paragraph(`Subject: ${"Acceptance of Abstract – " + EVENT.parent}`);
  paragraph(INTRO);
  paragraph(REGISTRATION);
  paragraph(DETAILS_LEAD, 6);

  for (const [label, value] of abstractDetails(author)) {
    page.drawText(`${label}:`, { x: MARGIN, y, size: BODY, font, color: NAVY });
    const indent = 76;
    const lines = wrap(value, strong, BODY - 0.5, width - indent);
    lines.forEach((line, i) => {
      page.drawText(line, {
        x: MARGIN + indent,
        y: y - i * LEAD,
        size: BODY - 0.5,
        font: strong,
        color: VALUE,
      });
    });
    y -= Math.max(lines.length, 1) * LEAD + 8;
  }

  y -= 6;
  paragraph(CLOSING, 16);
  for (const line of ["Warm regards,", COMMITTEE, EVENT.parent]) {
    page.drawText(line, { x: MARGIN, y, size: BODY, font, color: NAVY });
    y -= LEAD;
  }

  return pdf.save();
}
