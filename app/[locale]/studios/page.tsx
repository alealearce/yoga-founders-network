import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import { YOGA_CATEGORIES } from "@/lib/config/categories";
import { getIpLocation } from "@/lib/utils/ipLocation";
import SearchBar from "@/components/directory/SearchBar";
import FilteredListingGrid from "@/components/directory/FilteredListingGrid";

export const metadata: Metadata = {
  title: "Yoga Studios Worldwide",
  description: "Find yoga studios near you and around the world. Browse studios offering every style — Hatha, Vinyasa, Yin, Kundalini, and more. Compare locations, read reviews, and find the perfect studio for your practice.",
};

export default async function StudiosPage() {
  const [supabase, ipLocation] = await Promise.all([
    createClient(),
    getIpLocation(),
  ]);

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "studio")
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .limit(500);

  const studios: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#ffffff]">
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

      <FilteredListingGrid
        listings={studios}
        columns="4"
        filterGroups={[
          { field: "yoga_styles", options: YOGA_CATEGORIES.map(c => c.label) },
        ]}
        ipLocation={ipLocation}
        emptyTitle="Studios coming soon"
        emptyDescription="We are growing our global directory. Be the first studio in your city."
        emptyCta="List Your Studio"
      />
    </>
  );
}
