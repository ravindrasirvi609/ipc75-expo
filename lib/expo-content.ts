/**
 * Every fact about the exhibition, in one place.
 *
 * Transcribed from the official brochure (75th IPC PharmaExpo 2026). Pages read
 * from here and never hardcode a date, venue or rate — the site previously
 * advertised the wrong city because that content was scattered through JSX.
 *
 * `npm run verify:content` checks this file against the brochure figures and
 * fails if a stale value reappears anywhere in `app/`.
 */

export const EVENT = {
  /** The exhibition itself. */
  name: "Pharma PowderTech Expo 2026",
  shortName: "PharmaExpo 2026",
  /** Full title as printed on the brochure. */
  subtitle:
    "International Exhibition on Powder Processing, Particle Engineering and Pharmaceutical Manufacturing Technologies",
  /** The congress it runs inside. */
  parent: "75th Indian Pharmaceutical Congress",
  parentShort: "75th IPC",
  milestone: "Platinum Jubilee",
  theme: "Viksit Bharat · Viksit Pharmacy 2047",
  dates: {
    label: "18 – 20 December 2026",
    days: "Friday · Saturday · Sunday",
    start: "2026-12-18",
    end: "2026-12-20",
    dayCount: 3,
  },
} as const;

export const VENUE = {
  name: "Yashobhoomi Convention Centre",
  aka: "India International Convention & Expo Centre",
  hall: "Hall 1C",
  address: "Sector 25, Dwarka, New Delhi – 110077",
  city: "New Delhi",
  mapQuery: "Yashobhoomi Convention Centre, Sector 25, Dwarka, New Delhi 110077",
} as const;

export const ORGANISERS = {
  host: "Indian Pharmaceutical Graduates' Association",
  hostShort: "IPGA",
  congress: "Indian Pharmaceutical Congress Association",
  congressShort: "IPCA",
  sites: [
    { label: "75thipc.com", href: "https://www.75thipc.com" },
    { label: "ipga.in", href: "https://www.ipga.in" },
  ],
} as const;

/** Both space types offered, in rupees per square metre, before tax. */
export const SPACE_TYPES = [
  {
    id: "shell",
    name: "Shell space",
    rate: 12000,
    summary: "Built shell — walls, fascia and floor in place when you arrive.",
    detail:
      "The stall structure is supplied and erected for you. You bring your machinery, graphics and people.",
  },
  {
    id: "bare",
    name: "Bare space",
    rate: 11000,
    summary: "Raw floor area — you build the stall yourself.",
    detail:
      "Marked-out floor only. Suits heavy equipment, custom double-decker builds and exhibitors bringing their own contractor.",
  },
] as const;

export const RATE_UNIT = "per sq. m + taxes";

/**
 * The brochure states "plus Taxes" without naming a rate. This is used only to
 * show an indicative line in the calculator, and is labelled as such.
 */
export const INDICATIVE_GST = 0.18;

/** Stall module sold in Hall 1C. Matches lib/hall-1c-plan.ts. */
export const STALL_MODULE = { size: "3m × 3m", area: 9 } as const;

/** Who the exhibition sells to — in brochure order. */
export const EXHIBITOR_PROFILE = [
  "Pharmaceutical formulations, bulk drugs, active pharmaceutical ingredients, intermediates and excipients",
  "Biopharmaceuticals, vaccines, biotechnology products and biosimilars",
  "Pharmaceutical plant, processing machinery and production technologies",
  "Packaging materials, packaging machinery, labelling and track-and-trace solutions",
  "Laboratory equipment, analytical instruments, cleanroom systems and quality-control solutions",
  "Contract research, clinical research, contract development and manufacturing organisations",
  "R&D, process development, technology transfer and regulatory services",
  "Water, waste, environment, safety, cold-chain, logistics and infrastructure solutions",
  "Digital, automation, software, data and management solutions for the pharmaceutical industry",
  "Trade associations, institutions, technical publications and industry-support organisations",
] as const;

/** Who walks the floor — in brochure order. */
export const VISITOR_PROFILE = [
  "CEOs, business heads, plant heads, technocrats and scientists from pharmaceutical and biotechnology companies",
  "Purchase, procurement, sourcing, engineering, production, quality-control and quality-assurance professionals",
  "R&D specialists, formulation scientists, pharmacists, doctors and healthcare professionals",
  "Regulators, policymakers, government officials and representatives of trade and diplomatic organisations",
  "Hospital administrators, institutional buyers, distributors, agents and supply-chain professionals",
  "Academicians, teachers, researchers, students, consultants, investors and entrepreneurs",
] as const;

/** Exhibition sales team, as listed on the brochure. Primary contacts first. */
export const CONTACTS = [
  { name: "Vikram Chaudhary", phone: "9460959052" },
  { name: "Kishan Seervi", phone: "8290122535" },
  { name: "Kamal Bhardwaj", phone: "9899392930" },
  { name: "Chetan Salvi", phone: "9773124383" },
] as const;

export const EMAILS = ["expo@75thipc.com", "exhibition.75ipc@gmail.com"] as const;

/** Turns "9899392930" into a dialable +91 href. */
export const telHref = (phone: string) => `tel:+91${phone.replace(/\D/g, "")}`;
/** Turns "9899392930" into "+91 98993 92930". */
export const telLabel = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

export const rupees = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
