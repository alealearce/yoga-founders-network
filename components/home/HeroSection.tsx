import Image from "next/image";
import { Search } from "lucide-react";
import { COPY } from "@/lib/config/site";

interface HeroSectionProps {
  listingCount: number;
  countryCount: number;
}

export default function HeroSection({ listingCount, countryCount }: HeroSectionProps) {
  return (
    <section className="border-b border-outline-variant bg-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-36 lg:pt-40 pb-16 lg:pb-20">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">

          {/* LEFT — text + search */}
          <div className="min-w-0">
            {/* Eyebrow */}
            <p className="font-sans text-xs font-bold tracking-[0.18em] text-accent-text uppercase">
              The Global Yoga Directory
            </p>

            {/* Headline — one display weight; the accent carries the thesis */}
            <h1 className="font-serif text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.06] tracking-[-0.015em] text-on-surface mt-5 [text-wrap:balance]">
              {COPY.hero.headline}{" "}
              <em className="text-accent-text">{COPY.hero.headlineAccent}</em>
            </h1>

            {/* Subheadline */}
            <p className="font-sans text-base lg:text-lg text-on-surface-variant leading-relaxed mt-6 max-w-xl">
              {COPY.hero.subheadline}
            </p>

            {/* Search rule — a single underlined line, not a floating card.
                Plain GET form so the hero stays a server component. */}
            <form action="/search" method="get" className="mt-12 flex items-center gap-4 border-b-2 border-on-surface pb-3.5">
              <Search size={22} className="flex-shrink-0 text-on-surface" aria-hidden="true" />
              <input
                type="text"
                name="q"
                placeholder={COPY.searchPlaceholder}
                aria-label="Search the directory"
                className="flex-1 min-w-0 bg-transparent font-serif italic text-[clamp(1.125rem,2.2vw,1.5rem)] text-on-surface placeholder:text-on-surface-variant/70 outline-none"
              />
              <button
                type="submit"
                className="flex-shrink-0 px-6 py-3 rounded-[2px] font-sans text-sm font-bold bg-primary text-primary-on hover:bg-accent transition-colors duration-300"
              >
                Search
              </button>
            </form>

            {/* Trust line — real counts from the network */}
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

          {/* RIGHT — hero image, mounted like a print: squared, with an offset
              hairline frame instead of the old rounded blob */}
          <div className="relative hidden lg:block">
            <div
              className="absolute -top-4 -right-4 w-full h-full border border-accent-text/50 rounded-[2px]"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] rounded-[2px] overflow-hidden border border-outline-variant">
              <Image
                src="/images/hero.jpg"
                alt="Yoga practice — finding your space to breathe"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 0px, 45vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
