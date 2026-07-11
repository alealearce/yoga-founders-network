import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { COPY, SITE } from "@/lib/config/site";
import type { Listing, BlogPost } from "@/lib/supabase/types";
import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import ListingCard from "@/components/directory/ListingCard";
import YogaSilhouette from "@/components/ui/YogaSilhouette";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: SITE.url },
  openGraph: {
    url: SITE.url,
  },
};

// Canonical category hubs — links the homepage (our highest-authority page)
// directly to each hub's canonical URL, distributing link equity across all six.
// `type` matches listings.type so each row can show its live count.
const CATEGORIES = [
  { name: "Yoga Studios",       type: "studio",   href: "/yogastudio",    desc: "Find studios near you — every style, every level." },
  { name: "Yoga Teachers",      type: "teacher",  href: "/yogateacher",   desc: "Local instructors and world-renowned guides." },
  { name: "Teacher Training",   type: "school",   href: "/yogaschool",    desc: "Yoga Alliance-accredited schools & certifications." },
  { name: "Yoga Retreats",      type: "retreat",  href: "/retreatcenter", desc: "Weekend escapes and immersive journeys." },
  { name: "Yoga Products",      type: "product",  href: "/yogaproducts",  desc: "Mats, props, apparel, books, and courses." },
  { name: "Workshops & Events", type: "workshop", href: "/yogaworkshops", desc: "Intensives, immersions, and special events." },
];

export default async function HomePage() {
  const supabase = await createClient();

  const [listingsRes, postsRes, registerRes] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("status", "approved")
      .eq("is_featured", true)
      .order("rating_avg", { ascending: false })
      .limit(6),
    supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("listings")
      .select("country, type")
      .eq("status", "approved"),
  ]);

  const listings: Listing[] = listingsRes.data ?? [];
  const posts: BlogPost[]   = postsRes.data ?? [];
  const register = (registerRes.data ?? []) as { country: string | null; type: string }[];

  // The register in numbers — countries and per-category counts, one query.
  const countryCounts = new Map<string, number>();
  const typeCounts    = new Map<string, number>();
  for (const row of register) {
    if (row.country) countryCounts.set(row.country, (countryCounts.get(row.country) ?? 0) + 1);
    typeCounts.set(row.type, (typeCounts.get(row.type) ?? 0) + 1);
  }
  const countries = Array.from(countryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <>
      <HeroSection listingCount={register.length} countryCount={countries.length} />

      {/* ── The register: category index ── */}
      <section className="py-20 lg:py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div className="max-w-2xl">
              <p className="font-sans text-xs font-bold tracking-[0.18em] text-on-surface-variant uppercase mb-2">
                The Directory
              </p>
              <h2 className="font-serif text-display-sm text-on-surface">
                Browse the network
              </h2>
            </div>
            <Link
              href="/about"
              className="flex-shrink-0 font-sans text-sm font-bold text-accent-text hover:underline underline-offset-4"
            >
              About our review standard →
            </Link>
          </div>

          <div className="border-t border-outline-variant">
            {CATEGORIES.map(cat => {
              const count = typeCounts.get(cat.type) ?? 0;
              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="group grid grid-cols-[1fr_auto] md:grid-cols-[minmax(200px,1.1fr)_2fr_auto_auto] gap-x-6 items-baseline px-2 py-6 lg:py-7 border-b border-outline-variant hover:bg-surface-card transition-colors duration-300"
                >
                  <span className="font-serif text-[clamp(1.625rem,3.4vw,2.375rem)] tracking-[-0.01em] text-on-surface group-hover:text-accent-text transition-colors duration-300">
                    {cat.name}
                  </span>
                  <span className="hidden md:block font-sans text-sm text-on-surface-variant">
                    {cat.desc}
                  </span>
                  <span className="hidden md:block font-sans text-sm text-on-surface-variant text-right min-w-[4.5rem] tabular-nums">
                    <b className="font-extrabold text-base text-on-surface">{count}</b> listed
                  </span>
                  <span className="text-accent-text text-xl group-hover:translate-x-1.5 transition-transform duration-300">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ── */}
      <section className="py-20 lg:py-24 bg-bg border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="font-sans text-xs font-bold tracking-[0.18em] text-on-surface-variant uppercase mb-2">
                Community Picks
              </p>
              <h2 className="font-serif text-display-sm text-on-surface">
                {COPY.featuredSection.title}
              </h2>
              <p className="font-sans text-base text-on-surface-variant mt-2 max-w-xl">
                {COPY.featuredSection.subtitle}
              </p>
            </div>
            <Link
              href="/yogastudio"
              className="flex-shrink-0 font-sans text-sm font-bold text-accent-text hover:underline underline-offset-4"
            >
              {COPY.featuredSection.cta} →
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(listing => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  slug={listing.slug}
                  name={listing.name}
                  type={listing.type}
                  tagline={listing.tagline ?? undefined}
                  city={listing.city ?? undefined}
                  country={listing.country ?? undefined}
                  logo_url={listing.logo_url}
                  images={listing.images}
                  yoga_styles={listing.yoga_styles}
                  rating_avg={listing.rating_avg}
                  rating_count={listing.rating_count}
                  is_verified={listing.is_verified}
                  is_featured={listing.is_featured}
                  price_range={listing.price_range}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<YogaSilhouette pose="lotus" size={64} color="#8C7B60" />}
              title="Our community is growing"
              description="Be among the first to list your studio, school, or practice in our global directory."
              cta={{ label: "List Your Space", href: "/submit" }}
            />
          )}
        </div>
      </section>

      {/* ── Explore by Country ── */}
      {countries.length > 0 && (
        <section className="py-20 lg:py-24 bg-bg border-t border-outline-variant">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <p className="font-sans text-xs font-bold tracking-[0.18em] text-on-surface-variant uppercase mb-2">
                A Global Practice
              </p>
              <h2 className="font-serif text-display-sm text-on-surface">
                Explore by country
              </h2>
            </div>

            {/* Typographic country run — serif names, superscript counts */}
            <p className="font-serif text-[clamp(1.1875rem,2.6vw,1.625rem)] leading-[1.9]">
              {countries.map(({ name, count }) => (
                <Link
                  key={name}
                  href={`/search?country=${encodeURIComponent(name)}`}
                  className="group inline-block whitespace-nowrap pr-7"
                >
                  <span className="text-on-surface group-hover:text-accent-text group-hover:underline underline-offset-4 decoration-1 transition-colors duration-200">
                    {name}
                  </span>
                  <sup className="font-sans text-xs font-bold text-on-surface-variant ml-1 tabular-nums">
                    {count}
                  </sup>
                </Link>
              ))}
            </p>
          </div>
        </section>
      )}

      {/* ── The Journal ── */}
      <section className="py-20 lg:py-24 bg-bg border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="font-sans text-xs font-bold tracking-[0.18em] text-on-surface-variant uppercase mb-2">
                Stories & Wisdom
              </p>
              <h2 className="font-serif text-display-sm text-on-surface">
                {COPY.communitySection.title}
              </h2>
              <p className="font-sans text-base text-on-surface-variant mt-2 max-w-xl">
                {COPY.communitySection.subtitle}
              </p>
            </div>
            <Link
              href="/community"
              className="flex-shrink-0 font-sans text-sm font-bold text-accent-text hover:underline underline-offset-4"
            >
              {COPY.communitySection.cta} →
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<YogaSilhouette pose="seated" size={64} color="#8C7B60" />}
              title="Stories coming soon"
              description="Insights, studio spotlights, and wisdom from the global yoga community."
              cta={{ label: "Read the Journal", href: "/community" }}
            />
          )}
        </div>
      </section>

      {/* ── Submit CTA Panel ── */}
      <section className="py-24 lg:py-28 bg-primary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-sans text-xs font-bold tracking-[0.18em] text-primary-on/60 uppercase">
            Join the Network
          </p>
          <h2 className="font-serif text-[clamp(2.25rem,5.5vw,3.875rem)] leading-[1.08] tracking-[-0.01em] text-primary-on mt-4 max-w-2xl [text-wrap:balance]">
            {COPY.submitCta.title}{" "}
            <em className="text-accent">{COPY.submitCta.titleAccent}</em>
          </h2>
          <p className="font-sans text-base lg:text-lg text-primary-on/70 max-w-xl mt-5 mb-9">
            {COPY.submitCta.subtitle}
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center px-7 py-3.5 rounded-[2px] font-sans text-sm font-bold bg-primary-on text-primary hover:bg-accent hover:text-primary-on transition-colors duration-300"
          >
            {COPY.submitCta.cta}
          </Link>
        </div>
      </section>
    </>
  );
}

// ── Blog Card ────────────────────────────────────────────────────────────────

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/community/${post.slug}`}
      className="group block border border-outline-variant rounded-[2px] overflow-hidden bg-bg hover:bg-surface-card transition-colors duration-300"
    >
      {/* Cover */}
      <div className="relative h-48 bg-surface-low overflow-hidden">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary-container/50">
            <YogaSilhouette pose="lotus" size={72} color="#8C7B60" />
          </div>
        )}
        {post.tags?.[0] && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full border border-accent-text bg-bg text-accent-text font-sans text-[10px] font-extrabold tracking-[0.14em] uppercase">
              {post.tags[0]}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-xl text-on-surface group-hover:text-accent-text transition-colors duration-300 leading-snug mb-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 font-sans text-xs text-on-surface-variant">
          <span className="font-medium">{post.author}</span>
          {post.reading_time_minutes && (
            <>
              <span>·</span>
              <span>{post.reading_time_minutes} min read</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="text-center py-20 border border-outline-variant rounded-[2px]">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-serif text-2xl text-on-surface mb-2">{title}</h3>
      <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
        {description}
      </p>
      <Link
        href={cta.href}
        className="inline-flex px-6 py-3 rounded-[2px] font-sans text-sm font-bold bg-primary text-primary-on hover:bg-accent transition-colors duration-300"
      >
        {cta.label}
      </Link>
    </div>
  );
}
