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

/** Who the exhibition sells to — 16 categories, in brochure order. */
export const EXHIBITOR_PROFILE = [
  "Powder Processing and Particle Technology",
  "Pharmaceutical Processing and Manufacturing Machinery",
  "API and Formulation Manufacturing Equipment",
  "Mixing, Milling, Granulation and Drying Technologies",
  "Material Handling, Conveying and Storage Systems",
  "Tablet, Capsule and Powder-Filling Machinery",
  "Cleanroom, HVAC and Containment Solutions",
  "Dust Control, Filtration and Industrial Safety Systems",
  "Process Automation, Instrumentation and Digital Technologies",
  "Laboratory, Testing and Quality-Control Equipment",
  "Pharmaceutical Packaging Machinery and Materials",
  "Stainless-Steel Equipment and Process Components",
  "Plant Engineering and Turnkey Project Solutions",
  "Contract Manufacturing and Processing Services",
  "Excipients, Pharmaceutical Ingredients and Specialty Materials",
  "Research, Consultancy, Validation and Regulatory Services",
] as const;

/** Who walks the floor — 17 categories, in brochure order. */
export const VISITOR_PROFILE = [
  "Pharmaceutical Formulation Manufacturers",
  "API and Intermediate Manufacturers",
  "Biotechnology and Biopharmaceutical Companies",
  "Nutraceutical and Dietary Supplement Manufacturers",
  "Herbal, AYUSH and Traditional Medicine Manufacturers",
  "Veterinary Pharmaceutical Manufacturers",
  "Chemical and Specialty Chemical Companies",
  "Cosmetics and Personal-Care Manufacturers",
  "Food, Dairy and Health-Ingredient Manufacturers",
  "Contract Research and Manufacturing Organisations",
  "Pharmaceutical Machinery and Equipment Buyers",
  "Plant Engineering and Project Consultants",
  "Importers, Exporters, Distributors and Technology Agents",
  "Research Laboratories and Academic Institutions",
  "Government Departments and Regulatory Authorities",
  "Industry Associations and Trade Organisations",
  "Investors, Innovators and Start-ups",
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
