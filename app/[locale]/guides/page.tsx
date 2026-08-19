import Link from "next/link";
import type { Metadata } from "next";
import { CITY_GUIDES, type CityGuideSummary } from "@/lib/cityGuides";
import { SITE } from "@/lib/config/site";

const BASE = SITE.url;

export const metadata: Metadata = {
  title: "City Guides",
  description:
    "Every yoga studio we list, city by city — addresses, websites and the styles each studio teaches. New York, Toronto, Vancouver, Seattle, Los Angeles and more.",
  alternates: {
    canonical: `${BASE}/guides`,
    languages: { en: `${BASE}/guides`, "x-default": `${BASE}/guides` },
  },
};

export default function GuidesHubPage() {
  const guides = CITY_GUIDES.slice().sort(
    (a: CityGuideSummary, b: CityGuideSummary) => b.studioCount - a.studioCount,
  );
  const total = guides.reduce((n, g) => n + g.studioCount, 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="border-b border-outline-variant pb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-text">City Guides</p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-on-surface">
          Where to practise, city by city
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
          {total} studios across {guides.length} cities, each one listed with its address, website and the
          styles it teaches.
        </p>
      </header>

      <ul className="mt-10">
        {guides.map((g) => (
          <li key={g.slug} className="border-b border-outline-variant py-6">
            <Link
              href={`/guides/${g.slug}`}
              className="flex items-baseline justify-between gap-4 group"
            >
              <span className="font-serif text-2xl text-on-surface underline-offset-[6px] group-hover:underline">
                {g.city}
              </span>
              <span className="shrink-0 text-sm text-on-surface-variant">
                {g.studioCount} studios
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
