import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import { YOGA_CATEGORIES } from "@/lib/config/categories";
import { getIpLocation } from "@/lib/utils/ipLocation";
import { SITE } from "@/lib/config/site";
import SearchBar from "@/components/directory/SearchBar";
import FilteredListingGrid from "@/components/directory/FilteredListingGrid";
import CategoryJsonLd from "@/components/directory/CategoryJsonLd";

export const metadata: Metadata = {
  title: "Yoga Studios Near You — Global Directory",
  description: "Find yoga studios near your location, ranked by distance. Browse 700+ verified studios across the US, Canada, and worldwide — every style, every level. Hot yoga, Vinyasa, Hatha, Yin, Kundalini.",
  alternates: { canonical: `${SITE.url}/yogastudio` },
  openGraph: {
    title: "Yoga Studios Near You",
    description: "Find yoga studios near your location, ranked by distance.",
    url: `${SITE.url}/yogastudio`,
  },
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
      <CategoryJsonLd
        name="Yoga Studios Near You"
        description="Yoga studios indexed in the Yoga Founders Network global directory, ranked by distance to the visitor."
        url={`${SITE.url}/yogastudio`}
        listings={studios}
        total={total}
      />
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              The Directory
            </p>
            <h1 className="font-serif text-display-md text-on-surface mb-4">
              Find Yoga Studios Near You
            </h1>
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-8">
              Discover yoga studios near your location, ranked by distance — then filter by style, level, or vibe.
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
        enableCountryFilter
        emptyTitle="Studios coming soon"
        emptyDescription="We are growing our global directory. Be the first studio in your city."
        emptyCta="List Your Studio"
      />
    </>
  );
}
