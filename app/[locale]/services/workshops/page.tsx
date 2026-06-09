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
  title: "Yoga Workshops & Events Near You",
  description: "Find yoga workshops, intensives, and special events near your location, ranked by distance. Single-session deep dives, weekend immersions, and themed events.",
  alternates: { canonical: `${SITE.url}/yogaworkshops` },
  openGraph: {
    title: "Yoga Workshops & Events Near You",
    description: "Yoga workshops and events nearest to you.",
    url: `${SITE.url}/yogaworkshops`,
  },
};

export default async function WorkshopsPage() {
  const [supabase, ipLocation] = await Promise.all([
    createClient(),
    getIpLocation(),
  ]);

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "workshop")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  const workshops: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      <CategoryJsonLd
        name="Yoga Workshops & Events Near You"
        description="Yoga workshops and events in the Yoga Founders Network directory, ranked by distance to the visitor."
        url={`${SITE.url}/yogaworkshops`}
        listings={workshops}
        total={total}
      />
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              Services — Events
            </p>
            <h1 className="font-serif text-display-md text-on-surface mb-4">
              Yoga Workshops &amp; Events Near You
            </h1>
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-8">
              Deepen your practice and meet new teachers at workshops nearest to your location — single-session deep dives, weekend immersions, and themed events.
            </p>
            {total > 0 && (
              <p className="font-sans text-sm text-on-surface-variant/70 mb-6">
                {total.toLocaleString()} workshop{total !== 1 ? "s" : ""} &amp; event{total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <SearchBar
            initialType="workshop"
            showFilters={false}
            placeholder="Search yoga workshops and events..."
          />
        </div>
      </section>

      <FilteredListingGrid
        listings={workshops}
        filterGroups={[
          { field: "yoga_styles", options: YOGA_CATEGORIES.map(c => c.label) },
        ]}
        ipLocation={ipLocation}
        enableCountryFilter
        emptyTitle="Events coming soon"
        emptyDescription="Running a yoga workshop or event? Get it in front of the community."
        emptyCta="List Your Event"
      />
    </>
  );
}
