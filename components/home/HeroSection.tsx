import { Search } from "lucide-react";
import { COPY } from "@/lib/config/site";

interface HeroSectionProps {
  listingCount: number;
  countryCount: number;
}

export default function HeroSection({ listingCount, countryCount }: HeroSectionProps) {
  return (
    <section className="border-b border-outline-variant bg-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-36 lg:pt-44 pb-16 lg:pb-20">
        {/* Eyebrow */}
        <p className="font-sans text-xs font-bold tracking-[0.18em] text-accent-text uppercase">
          The Global Yoga Directory
        </p>

        {/* Headline — one display weight; the accent line carries the thesis */}
        <h1 className="font-serif text-[clamp(2.75rem,7vw,5.25rem)] leading-[1.04] tracking-[-0.015em] text-on-surface mt-5 max-w-4xl [text-wrap:balance]">
          {COPY.hero.headline}{" "}
          <em className="text-accent-text">{COPY.hero.headlineAccent}</em>
        </h1>

        {/* Subheadline */}
        <p className="font-sans text-base lg:text-lg text-on-surface-variant leading-relaxed mt-7 max-w-xl">
          {COPY.hero.subheadline}
        </p>

        {/* Search rule — a single underlined line, not a floating card.
            Plain GET form so the hero stays a server component. */}
        <form action="/search" method="get" className="mt-14 flex items-center gap-4 border-b-2 border-on-surface pb-3.5">
          <Search size={24} className="flex-shrink-0 text-on-surface" aria-hidden="true" />
          <input
            type="text"
            name="q"
            placeholder={COPY.searchPlaceholder}
            aria-label="Search the directory"
            className="flex-1 min-w-0 bg-transparent font-serif italic text-[clamp(1.25rem,3vw,1.75rem)] text-on-surface placeholder:text-on-surface-variant/70 outline-none"
          />
          <button
            type="submit"
            className="flex-shrink-0 px-6 py-3 rounded-[2px] font-sans text-sm font-bold bg-primary text-primary-on hover:bg-accent transition-colors duration-300"
          >
            Search
          </button>
        </form>

        {/* Trust line — real counts from the register */}
        <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 font-sans text-[13px] font-semibold text-on-surface-variant tabular-nums">
          <span>
            <b className="font-extrabold text-on-surface">{listingCount}</b> verified listings
          </span>
          <span>
            <b className="font-extrabold text-on-surface">{countryCount}</b>{" "}
            {countryCount === 1 ? "country" : "countries"}
          </span>
          <span>
            <b className="font-extrabold text-on-surface">6</b> categories
          </span>
          <span>Every entry human-reviewed</span>
        </div>
      </div>
    </section>
  );
}
