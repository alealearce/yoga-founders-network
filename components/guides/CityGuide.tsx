import Link from "next/link";
import { MapPin, Globe, BadgeCheck, Star } from "lucide-react";
import { SITE } from "@/lib/config/site";

/**
 * City studio guide — the Warm Register applied to a long index: hairlines
 * instead of cards, Instrument Serif at a single weight (never font-bold),
 * turmeric on lines and large text only, 2px radius.
 *
 * This is an index, not a ranking. Studios are alphabetical and the page says
 * why — see the note in scripts/build-city-guides.mjs.
 */

export type GuideEntry = {
  name: string;
  url: string;
  address: string | null;
  website: string | null;
  styles: string[];
  levels: string[];
  languages: string[];
  verified: boolean;
  rating: { avg: number; count: number } | null;
};

export type CityGuideData = {
  slug: string;
  city: string;
  country: string;
  title: string;
  generatedAt: string;
  studioCount: number;
  verifiedCount: number;
  ratedCount: number;
  topStyles: { style: string; count: number }[];
  entries: GuideEntry[];
};

export default function CityGuide({ guide }: { guide: CityGuideData }) {
  const styleLine = guide.topStyles
    .slice(0, 3)
    .map((s) => `${s.style} (${s.count})`)
    .join(", ");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="border-b border-outline-variant pb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-text">
          {guide.city}
          {guide.country ? ` · ${guide.country}` : ""}
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-on-surface">{guide.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
          Every studio we list in {guide.city} — {guide.studioCount} of them, {guide.verifiedCount} verified by
          their founder. Listed A to Z, with the styles each one teaches.
        </p>
        {styleLine && (
          <p className="mt-4 text-base leading-relaxed text-on-surface-variant">
            Most taught here: {styleLine}.
          </p>
        )}
      </header>

      {/* Say plainly what the order is and is not. A reader who assumes a
          ranking and finds an index has been misled by omission. */}
      <p className="mt-8 border-l-2 border-accent pl-5 text-sm leading-relaxed text-on-surface-variant">
        This is an index, not a ranking. Only {guide.ratedCount} of these {guide.studioCount} studios carry
        enough member ratings to compare, so ordering them would say more about who filled in a profile than
        about who teaches well. Alphabetical until that changes.
      </p>

      <ul className="mt-10">
        {guide.entries.map((e) => (
          <li key={e.url} className="border-b border-outline-variant py-7">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <Link href={e.url} className="font-serif text-2xl text-on-surface underline-offset-[6px] hover:underline">
                {e.name}
              </Link>
              {e.verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-accent px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-accent-text">
                  <BadgeCheck className="h-3 w-3" aria-hidden />
                  Verified
                </span>
              )}
              {e.rating && (
                <span className="inline-flex items-center gap-1 text-sm text-on-surface-variant">
                  <Star className="h-3.5 w-3.5 text-accent" aria-hidden />
                  {e.rating.avg.toFixed(1)}
                  <span className="text-on-surface-variant/70">({e.rating.count})</span>
                </span>
              )}
            </div>

            {e.styles.length > 0 && (
              <p className="mt-2.5 text-sm text-on-surface-variant">{e.styles.join(" · ")}</p>
            )}

            <div className="mt-2 space-y-1 text-sm text-on-surface-variant">
              {e.address && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                  <span>{e.address}</span>
                </p>
              )}
              {e.website && (
                <p className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                  <a
                    href={e.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all hover:text-on-surface"
                  >
                    {e.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <footer className="mt-12 space-y-5 text-sm leading-relaxed text-on-surface-variant">
        <p>
          Compiled {guide.generatedAt}. Run a studio in {guide.city} that is not here, or spot something out of
          date?{" "}
          <Link href="/submit" className="text-accent-text underline underline-offset-4">
            Add it free
          </Link>{" "}
          or email{" "}
          <a href={`mailto:${SITE.email}`} className="text-accent-text underline underline-offset-4">
            {SITE.email}
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
