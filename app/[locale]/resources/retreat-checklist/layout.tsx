import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Yoga Retreat Planning Checklist — Free Tool",
  description: "Generate a comprehensive, personalized checklist for planning your next yoga retreat — from booking venues to post-retreat follow-up, with pro tips.",
  alternates: { canonical: `${SITE.url}/resources/retreat-checklist` },
};

export default function RetreatChecklistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
