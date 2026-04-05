import Image from "next/image";
import Link from "next/link";
import { COPY } from "@/lib/config/site";
import SearchBar from "@/components/directory/SearchBar";

export default function HeroSection() {
  const lines = COPY.hero.headline.split("\n");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#fafaf5]">
      {/* Background subtle gradient */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 50%, #dde5d4 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* LEFT — Text + Search */}
          <div className="flex flex-col gap-8 z-10">
            {/* Eyebrow */}
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase">
              The Global Yoga Directory
            </p>

            {/* Headline */}
            <h1 className="font-serif text-display-lg text-on-surface leading-[1.08]">
              {lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {/* Subheadline */}
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed max-w-md">
              {COPY.hero.subheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/studios"
                className="px-7 py-3.5 rounded-full font-sans text-sm font-semibold text-white transition-all duration-400 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
              >
                {COPY.hero.cta}
              </Link>
              <Link
                href="/submit"
                className="px-7 py-3.5 rounded-full font-sans text-sm font-semibold text-primary bg-secondary-container hover:bg-secondary-container/80 transition-all duration-400"
              >
                {COPY.hero.ctaSecondary}
              </Link>
            </div>

            {/* Floating Search Card */}
            <div className="bg-surface-card rounded-2xl shadow-card p-6 mt-2">
              <p className="font-sans text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-4">
                Find your practice
              </p>
              <SearchBar
                placeholder={COPY.searchPlaceholder}
                showFilters={true}
              />
            </div>
          </div>

          {/* RIGHT — Aperture image */}
          <div className="relative hidden lg:flex items-center justify-end">
            <div
              className="relative w-full max-w-lg overflow-hidden"
              style={{
                aspectRatio: "4/5",
                borderRadius: "1.5rem 1.5rem 1.5rem 0",
              }}
            >
              <Image
                src="/images/hero.jpg"
                alt="Yoga practice — finding your space to breathe"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 0px, 50vw"
              />
              {/* Subtle overlay for depth */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background:
                    "linear-gradient(135deg, #536046 0%, transparent 60%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile hero image — shown below content on small screens */}
      <div
        className="absolute inset-0 -z-10 lg:hidden opacity-10"
        style={{
          background: "radial-gradient(circle at 50% 80%, #dde5d4 0%, transparent 60%)",
        }}
      />
    </section>
  );
}
