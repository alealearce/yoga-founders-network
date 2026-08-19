/**
 * Access to the generated city guides in data/city-guides/.
 *
 * Built by scripts/build-city-guides.mjs and committed, so the pages render
 * from the repo with no request-time database read. Rebuild after listings
 * change:
 *
 *   node scripts/build-city-guides.mjs --write
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CityGuideData } from "@/components/guides/CityGuide";

const DIR = join(process.cwd(), "data", "city-guides");

export type CityGuideSummary = {
  slug: string;
  city: string;
  country: string;
  title: string;
  studioCount: number;
  generatedAt: string;
};

export const CITY_GUIDES: CityGuideSummary[] = (() => {
  try {
    return JSON.parse(readFileSync(join(DIR, "index.json"), "utf8")) as CityGuideSummary[];
  } catch {
    return [];
  }
})();

const cache = new Map<string, CityGuideData | null>();

export function getCityGuide(slug: string): CityGuideData | null {
  if (cache.has(slug)) return cache.get(slug)!;
  // Guard the path: the slug arrives from the URL.
  const known = CITY_GUIDES.some((g) => g.slug === slug);
  const guide = known ? (JSON.parse(readFileSync(join(DIR, `${slug}.json`), "utf8")) as CityGuideData) : null;
  cache.set(slug, guide);
  return guide;
}

/** The guide covering a city, for cross-linking from listing pages. */
export function guideForCity(city: string | null | undefined): CityGuideSummary | undefined {
  if (!city) return undefined;
  return CITY_GUIDES.find((g) => g.city.toLowerCase() === city.toLowerCase());
}
