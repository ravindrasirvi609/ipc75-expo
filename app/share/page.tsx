import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ShareGenerator from "@/components/site/ShareGenerator";
import "@/components/site/site.css";
import "./share.css";

export const metadata: Metadata = {
  title: "Social Media Post Generator",
  description: "Create your personalised 75th IPC registration post.",
};

export default function SharePage() {
  return (
    <>
      <SiteHeader />
      <main className="share-page">
        <section className="share-intro">
          <div className="share-shell">
            <p className="eyebrow">75th IPC · Share your registration</p>
            <h1 className="display-l">Make it personal.</h1>
            <p className="lede">Add your details and photo to create a ready-to-share Platinum Jubilee post.</p>
          </div>
        </section>
        <ShareGenerator />
      </main>
      <SiteFooter />
    </>
  );
}
