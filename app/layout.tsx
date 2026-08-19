import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";
import { CursorProvider } from "@/providers/CursorProvider";
import { RoomTransitionProvider } from "@/providers/RoomTransitionProvider";
import { Nav } from "@/components/Nav/Nav";
import { Cursor } from "@/components/Cursor/Cursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "75th Indian Pharmaceutical Congress",
  description: "The 75th Indian Pharmaceutical Congress — a digital exhibition experience.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>
          <CursorProvider>
            <RoomTransitionProvider>
              <Nav />
              {children}
              <Cursor />
            </RoomTransitionProvider>
          </CursorProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
