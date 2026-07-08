import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Studio Re-Engagement Email Generator — Free Tool",
  description: "Win back dormant students with a complete 7-email sequence tailored to your studio's voice, tone, and offer. Includes subject lines, preview text, and send timing.",
  alternates: { canonical: `${SITE.url}/resources/email-generator` },
};

export default function EmailGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
