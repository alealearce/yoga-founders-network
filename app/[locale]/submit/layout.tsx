import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "List Your Yoga Studio, Class or Retreat",
  description: "Add your yoga studio, teacher profile, retreat, school, or product to the global Yoga Founders Network directory. Free to apply — reviewed within 2–3 business days.",
  alternates: { canonical: `${SITE.url}/submit` },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
