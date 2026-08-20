import type { Metadata } from "next";
import { EVENT, VENUE } from "@/lib/expo-content";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${EVENT.name} — ${EVENT.parent}`,
    template: `%s · ${EVENT.shortName}`,
  },
  description: `${EVENT.subtitle}. ${EVENT.dates.label} at ${VENUE.name}, ${VENUE.city}.`,
  keywords: [
    EVENT.name,
    EVENT.shortName,
    EVENT.parent,
    "pharma exhibition India",
    "powder processing expo",
    VENUE.name,
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
