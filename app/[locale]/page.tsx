import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { COPY, SITE } from "@/lib/config/site";
import type { Listing, BlogPost } from "@/lib/supabase/types";
import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import ListingCard from "@/components/directory/ListingCard";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
};

export default async function HomePage() {
  const supabase = await createClient();

  const [listingsRes, postsRes] = await Promise.all([
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
  ]);

  const listings: Listing[] = listingsRes.data ?? [];
  const posts: BlogPost[]   = postsRes.data ?? [];

  return (
    <>
      <HeroSection />

      {/* ── Featured Listings ── */}
      <section className="py-20 lg:py-28 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-2">
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
              href="/studios"
              className="flex-shrink-0 px-6 py-3 rounded-full font-sans text-sm font-semibold text-primary bg-secondary-container hover:bg-secondary-container/80 transition-all duration-400"
            >
              {COPY.featuredSection.cta}
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
              icon="🌿"
              title="Our community is growing"
              description="Be among the first to list your studio, school, or practice in our global directory."
              cta={{ label: "List Your Space", href: "/submit" }}
            />
          )}
        </div>
      </section>

      {/* ── The Journal ── */}
      <section className="py-20 lg:py-28 bg-surface-low">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-2">
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
              className="flex-shrink-0 px-6 py-3 rounded-full font-sans text-sm font-semibold text-primary bg-secondary-container hover:bg-secondary-container/80 transition-all duration-400"
            >
              {COPY.communitySection.cta}
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
              icon="📖"
              title="Stories coming soon"
              description="Insights, studio spotlights, and wisdom from the global yoga community."
              cta={{ label: "Read the Journal", href: "/community" }}
            />
          )}
        </div>
      </section>

      {/* ── Submit CTA Strip ── */}
      <section
        className="py-20 lg:py-28"
        style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-sans text-xs font-bold tracking-widest text-white/60 uppercase mb-4">
            Join the Network
          </p>
          <h2 className="font-serif text-display-sm text-white mb-4">
            {COPY.submitCta.title}
          </h2>
          <p className="font-sans text-lg text-white/75 max-w-xl mx-auto mb-10">
            {COPY.submitCta.subtitle}
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center px-8 py-4 rounded-full font-sans text-base font-semibold bg-white text-[#536046] hover:bg-white/90 transition-all duration-400"
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
      className="group block bg-surface-card rounded-2xl overflow-hidden hover:shadow-card transition-all duration-400 hover:-translate-y-1"
    >
      {/* Cover */}
      <div className="relative h-48 bg-surface-low overflow-hidden">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🪷
          </div>
        )}
        {post.tags?.[0] && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-primary text-white font-sans text-xs font-bold">
              {post.tags[0]}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors duration-300 leading-snug mb-2">
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
  icon: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-serif text-xl text-on-surface mb-2">{title}</h3>
      <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
        {description}
      </p>
      <Link
        href={cta.href}
        className="inline-flex px-6 py-3 rounded-full font-sans text-sm font-semibold text-white transition-all duration-400 hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
      >
        {cta.label}
      </Link>
    </div>
  );
}
