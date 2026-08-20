import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IPC 75 — The Future of Pharma",
  description:
    "Book your exhibition stall at the 75th Indian Pharmaceutical Congress.",
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
