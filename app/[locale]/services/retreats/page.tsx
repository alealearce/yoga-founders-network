import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import { RETREAT_DURATIONS } from "@/lib/config/categories";
import ListingCard from "@/components/directory/ListingCard";
import SearchBar from "@/components/directory/SearchBar";
import YogaSilhouette from "@/components/ui/YogaSilhouette";

export const metadata: Metadata = {
  title: "Yoga Retreats",
  description: "Discover transformative yoga retreats around the world. From weekend escapes to month-long immersions — find your sanctuary.",
};

export default async function RetreatsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "retreat")
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .limit(24);

  const retreats: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              Services — Retreats
            </p>
            <h1 className="font-serif text-display-md text-on-surface mb-4">
              Yoga Retreats
            </h1>
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-8">
              Step away from the everyday. Discover yoga retreats in Bali, Costa Rica, Italy, and beyond — choose your duration, your style, your sanctuary.
            </p>
            {total > 0 && (
              <p className="font-sans text-sm text-on-surface-variant/70 mb-6">
                {total.toLocaleString()} retreat{total !== 1 ? "s" : ""} worldwide
              </p>
            )}
          </div>
          <SearchBar
            initialType="retreat"
            showFilters={false}
            placeholder="Search yoga retreats by destination or style..."
          />
        </div>
      </section>

      {/* Duration Filters */}
      <section className="py-4 bg-[#fafaf5] border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <span className="font-sans text-xs text-on-surface-variant self-center mr-2">
              Duration:
            </span>
            <span className="px-4 py-1.5 rounded-full bg-primary text-white font-sans text-sm font-medium">
              Any Length
            </span>
            {RETREAT_DURATIONS.map(d => (
              <span
                key={d}
                className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant font-sans text-sm font-medium hover:bg-secondary-container hover:text-primary transition-all duration-300 cursor-pointer"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 lg:py-20 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {retreats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {retreats.map(retreat => (
                <ListingCard
                  key={retreat.id}
                  id={retreat.id}
                  slug={retreat.slug}
                  name={retreat.name}
                  type={retreat.type}
                  tagline={retreat.tagline ?? undefined}
                  city={retreat.city ?? undefined}
                  country={retreat.country ?? undefined}
                  logo_url={retreat.logo_url}
                  images={retreat.images}
                  yoga_styles={retreat.yoga_styles}
                  rating_avg={retreat.rating_avg}
                  rating_count={retreat.rating_count}
                  is_verified={retreat.is_verified}
                  is_featured={retreat.is_featured}
                  price_range={retreat.price_range}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="flex justify-center mb-4"><YogaSilhouette pose="tree" size={64} color="#c5c8bd" /></div>
              <h3 className="font-serif text-xl text-on-surface mb-2">
                Retreats coming soon
              </h3>
              <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
                Host a yoga retreat? Get it in front of thousands of seekers worldwide.
              </p>
              <a
                href="/submit"
                className="inline-flex px-6 py-3 rounded-full font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
              >
                List Your Retreat
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
