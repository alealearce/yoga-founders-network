import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getIpLocation } from "@/lib/utils/ipLocation";
import type { Listing } from "@/lib/supabase/types";
import { YOGA_CATEGORIES } from "@/lib/config/categories";
import { SITE } from "@/lib/config/site";
import SearchBar from "@/components/directory/SearchBar";
import FilteredListingGrid from "@/components/directory/FilteredListingGrid";
import CategoryJsonLd from "@/components/directory/CategoryJsonLd";

export const metadata: Metadata = {
  title: "Yoga Retreats Near You — Weekend & Immersive Escapes",
  description: "Find yoga retreats near your location, ranked by distance. Weekend escapes, week-long immersions, and month-long programs from Bali to Costa Rica to your nearest mountain.",
  alternates: { canonical: `${SITE.url}/retreatcenter` },
  openGraph: {
    title: "Yoga Retreats Near You",
    description: "Yoga retreats nearest to you — weekend, weeklong, and immersive.",
    url: `${SITE.url}/retreatcenter`,
  },
};

export default async function RetreatsPage() {
  const [supabase, ipLocation] = await Promise.all([
    createClient(),
    getIpLocation(),
  ]);

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
      <CategoryJsonLd
        name="Yoga Retreats Near You"
        description="Yoga retreats indexed in the Yoga Founders Network directory, ranked by distance to the visitor."
        url={`${SITE.url}/retreatcenter`}
        listings={retreats}
        total={total}
      />
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              Services — Retreats
            </p>
            <h1 className="font-serif text-display-md text-on-surface mb-4">
              Yoga Retreats Near You
            </h1>
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-8">
              Step away from the everyday — discover yoga retreats nearest to you, plus iconic destinations from Bali to Costa Rica. Choose your duration, style, and sanctuary.
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
        ipLocation={ipLocation}
        emptyTitle="Retreats coming soon"
        emptyDescription="Host a yoga retreat? Get it in front of thousands of seekers worldwide."
        emptyCta="List Your Retreat"
      />
    </>
  );
}
