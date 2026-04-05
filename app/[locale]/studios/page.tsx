import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import { YOGA_CATEGORIES } from "@/lib/config/categories";
import ListingCard from "@/components/directory/ListingCard";
import SearchBar from "@/components/directory/SearchBar";

export const metadata: Metadata = {
  title: "Yoga Studios",
  description: "Find yoga studios near you and around the world. Browse hundreds of studios offering all styles — from Hatha and Vinyasa to Yin and Kundalini.",
};

export default async function StudiosPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "studio")
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .limit(24);

  const studios: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              The Directory
            </p>
            <h1 className="font-serif text-display-md text-on-surface mb-4">
              Find Your Studio
            </h1>
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-8">
              Discover yoga studios in your city and around the globe. Filter by style, location, and vibe.
            </p>
            {total > 0 && (
              <p className="font-sans text-sm text-on-surface-variant/70 mb-6">
                {total.toLocaleString()} studio{total !== 1 ? "s" : ""} worldwide
              </p>
            )}
          </div>
          <SearchBar
            initialType="studio"
            showFilters={false}
            placeholder="Search yoga studios by name or city..."
          />
        </div>
      </section>

      {/* Style Filters */}
      <section className="py-4 bg-[#fafaf5] border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-1.5 rounded-full bg-primary text-white font-sans text-sm font-medium">
              All Styles
            </span>
            {YOGA_CATEGORIES.map(cat => (
              <span
                key={cat.id}
                className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant font-sans text-sm font-medium hover:bg-secondary-container hover:text-primary transition-all duration-300 cursor-pointer"
              >
                {cat.icon} {cat.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 lg:py-20 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Suspense fallback={<GridSkeleton />}>
            {studios.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {studios.map(studio => (
                  <ListingCard
                    key={studio.id}
                    id={studio.id}
                    slug={studio.slug}
                    name={studio.name}
                    type={studio.type}
                    tagline={studio.tagline ?? undefined}
                    city={studio.city ?? undefined}
                    country={studio.country ?? undefined}
                    logo_url={studio.logo_url}
                    images={studio.images}
                    yoga_styles={studio.yoga_styles}
                    rating_avg={studio.rating_avg}
                    rating_count={studio.rating_count}
                    is_verified={studio.is_verified}
                    is_featured={studio.is_featured}
                    price_range={studio.price_range}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🧘</div>
                <h3 className="font-serif text-xl text-on-surface mb-2">
                  Studios coming soon
                </h3>
                <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
                  We are growing our global directory. Be the first studio in your city.
                </p>
                <a
                  href="/submit"
                  className="inline-flex px-6 py-3 rounded-full font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
                >
                  List Your Studio
                </a>
              </div>
            )}
          </Suspense>
        </div>
      </section>
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-surface-card rounded-2xl overflow-hidden animate-pulse">
          <div className="h-52 bg-surface-low" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-surface-low rounded-full w-1/3" />
            <div className="h-5 bg-surface-low rounded-full w-3/4" />
            <div className="h-3 bg-surface-low rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
