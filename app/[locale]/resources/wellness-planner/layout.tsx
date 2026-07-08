import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Yoga & Wellness Planner — Free Tool",
  description: "Build a personalized morning yoga routine and daily meal plan based on your experience level, goals, and available time.",
  alternates: { canonical: `${SITE.url}/resources/wellness-planner` },
};

export default function WellnessPlannerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
