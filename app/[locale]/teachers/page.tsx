import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getIpLocation } from "@/lib/utils/ipLocation";
import type { Listing } from "@/lib/supabase/types";
import { YOGA_CATEGORIES, EXPERIENCE_LEVELS } from "@/lib/config/categories";
import { SITE } from "@/lib/config/site";
import SearchBar from "@/components/directory/SearchBar";
import FilteredListingGrid from "@/components/directory/FilteredListingGrid";
import CategoryJsonLd from "@/components/directory/CategoryJsonLd";

export const metadata: Metadata = {
  title: "Yoga Teachers Near You — Find Your Teacher",
  description: "Find yoga teachers near your location, ranked by distance. Browse by style, experience level (RYT 200, E-RYT 500), and location — local instructors and internationally renowned guides.",
  alternates: { canonical: `${SITE.url}/yogateacher` },
  openGraph: {
    title: "Yoga Teachers Near You",
    description: "Find yoga teachers near your location, ranked by distance.",
    url: `${SITE.url}/yogateacher`,
  },
};

export default async function TeachersPage() {
  const [supabase, ipLocation] = await Promise.all([
    createClient(),
    getIpLocation(),
  ]);

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "teacher")
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .limit(500);

  const teachers: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      <CategoryJsonLd
        name="Yoga Teachers Near You"
        description="Yoga teachers indexed in the Yoga Founders Network global directory, ranked by distance to the visitor."
        url={`${SITE.url}/yogateacher`}
        listings={teachers}
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
              Find Yoga Teachers Near You
            </h1>
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-8">
              Connect with yoga teachers nearest to you — from beginners&apos; guides to advanced practitioners. Filter by style and experience level.
            </p>
            {total > 0 && (
              <p className="font-sans text-sm text-on-surface-variant/70 mb-6">
                {total.toLocaleString()} teacher{total !== 1 ? "s" : ""} worldwide
              </p>
            )}
          </div>
          <SearchBar
            initialType="teacher"
            showFilters={false}
            placeholder="Search yoga teachers by name or style..."
          />
        </div>
      </section>

      <FilteredListingGrid
        listings={teachers}
        columns="4"
        filterGroups={[
          { field: "yoga_styles", options: YOGA_CATEGORIES.slice(0, 8).map(c => c.label) },
          { label: "Level:", field: "experience_levels", options: EXPERIENCE_LEVELS },
        ]}
        ipLocation={ipLocation}
        enableCountryFilter
        emptyTitle="Teachers coming soon"
        emptyDescription="Know an inspiring yoga teacher? Help them get discovered."
        emptyCta="List a Teacher"
      />
    </>
  );
}
