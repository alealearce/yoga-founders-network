import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Yoga Class Theme Generator — Free Tool",
  description: "Never run out of creative class ideas. Get a complete theme with intentions, peak poses, music suggestions, opening and closing scripts, and teaching points.",
  alternates: { canonical: `${SITE.url}/resources/class-theme-generator` },
};

export default function ClassThemeGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
