import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Yoga Studio Name Generator — Free Tool",
  description: "Discover the perfect name for your yoga studio with domain suggestions, taglines, and name meanings — generated based on your vibe, audience, and style.",
  alternates: { canonical: `${SITE.url}/resources/studio-name-generator` },
};

export default function StudioNameGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
