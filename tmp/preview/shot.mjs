import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const url = process.argv[2];
const out = process.argv[3];
const html = await (await fetch(url)).text();
const start = html.indexOf("<svg");
const end = html.indexOf("</svg>") + 6;
let svg = html.slice(start, end);
svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1388"');

// Only the SVG-facing rules from components/floor-plan/plan.css.
const style = `<style>
 text{font-family:Arial,Helvetica,sans-serif;fill:#000}
 .hp-heavy{font-weight:700}
 .hp-red-fill{fill:#ed1c24}
 .hp-yellow{fill:#fff200}
 .hp-wall,.hp-zone{fill:#fff;stroke:#000;stroke-width:2}
 .hp-aisle{fill:none;stroke:#ed1c24}
 .hp-blocked{fill:#ed1c24;stroke:#000;stroke-width:2}
 .hp-stall rect{fill:#fff;stroke:#000;stroke-width:2}
 .hp-stall.is-hold rect{fill:#ffc94a}
 .hp-stall.is-booked rect{fill:#3f4a54}
 .hp-stall.is-booked text{fill:#f4f7f4}
 .hp-stall.is-selected rect{fill:#ff735f;stroke-width:4}
</style>`;
svg = svg.replace(/(<svg[^>]*>)/, `$1${style}<rect x="279" y="224" width="1706" height="2152" fill="#fff"/>`);
await writeFile(out.replace(/\.png$/, ".svg"), svg, "utf8");
await sharp(Buffer.from(svg)).png().toFile(out);
console.log("wrote", out, svg.length, "bytes of svg");
