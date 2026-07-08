import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Find Your Perfect Yoga Teacher — Free Matching Tool",
  description: "Answer a few questions about your goals, style preferences, and priorities — and get matched with yoga teachers whose approach aligns with your practice.",
  alternates: { canonical: `${SITE.url}/resources/teacher-finder` },
};

export default function TeacherFinderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
