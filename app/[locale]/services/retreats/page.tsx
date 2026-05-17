import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import { YOGA_CATEGORIES } from "@/lib/config/categories";
import SearchBar from "@/components/directory/SearchBar";
import FilteredListingGrid from "@/components/directory/FilteredListingGrid";

export const metadata: Metadata = {
  title: "Yoga Retreats Worldwide",
  description: "Discover transformative yoga retreats around the world. From weekend escapes to month-long immersions — find your perfect sanctuary and book with confidence.",
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
    .limit(500);

  const retreats: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#ffffff]">
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

      <FilteredListingGrid
        listings={retreats}
        filterGroups={[
          { field: "yoga_styles", options: YOGA_CATEGORIES.map(c => c.label) },
        ]}
        emptyTitle="Retreats coming soon"
        emptyDescription="Host a yoga retreat? Get it in front of thousands of seekers worldwide."
        emptyCta="List Your Retreat"
      />
    </>
  );
}
