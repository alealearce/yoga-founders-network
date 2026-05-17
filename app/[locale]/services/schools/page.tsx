import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getIpLocation } from "@/lib/utils/ipLocation";
import type { Listing } from "@/lib/supabase/types";
import { SCHOOL_CERTIFICATIONS } from "@/lib/config/categories";
import SearchBar from "@/components/directory/SearchBar";
import FilteredListingGrid from "@/components/directory/FilteredListingGrid";

export const metadata: Metadata = {
  title: "Teacher Training & Yoga Schools",
  description: "Find accredited yoga teacher training programs and schools worldwide. Browse 200hr, 300hr, and 500hr certifications across all yoga traditions.",
};

export default async function SchoolsPage() {
  const [supabase, ipLocation] = await Promise.all([
    createClient(),
    getIpLocation(),
  ]);

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "school")
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .limit(500);

  const schools: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              Services — Schools
            </p>
            <h1 className="font-serif text-display-md text-on-surface mb-4">
              Teacher Training &amp; Schools
            </h1>
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-8">
              Begin or deepen your teaching journey. Discover accredited yoga teacher training programs — from weeklong immersions to full 500-hour certifications.
            </p>
            {total > 0 && (
              <p className="font-sans text-sm text-on-surface-variant/70 mb-6">
                {total.toLocaleString()} program{total !== 1 ? "s" : ""} worldwide
              </p>
            )}
          </div>
          <SearchBar
            initialType="school"
            showFilters={false}
            placeholder="Search teacher training programs..."
          />
        </div>
      </section>

      <FilteredListingGrid
        listings={schools}
        filterGroups={[
          { label: "Certification:", field: "experience_levels", options: [...SCHOOL_CERTIFICATIONS] },
        ]}
        ipLocation={ipLocation}
        emptyTitle="Teacher training programs coming soon"
        emptyDescription="We are building a curated directory of the world's best yoga teacher training schools. Know a great one? Submit it."
        emptyCta="List Your School"
      />
    </>
  );
}
