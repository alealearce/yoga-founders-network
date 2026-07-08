import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Yoga Studio Profitability Calculator — Free Tool",
  description: "Understand your studio's true financial health. Enter your costs and revenue streams, get an instant profit/loss summary and actionable improvement recommendations.",
  alternates: { canonical: `${SITE.url}/resources/profitability-calculator` },
};

export default function ProfitabilityCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
