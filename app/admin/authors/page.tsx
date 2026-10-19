import type { Metadata } from "next";
import AuthorsDesk from "@/components/admin/AuthorsDesk";

export const metadata: Metadata = {
  title: "Authors · Organiser desk",
  robots: { index: false, follow: false },
};

export default function AuthorsPage() {
  return <AuthorsDesk />;
}
