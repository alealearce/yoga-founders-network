import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import { YOGA_CATEGORIES } from "@/lib/config/categories";
import SearchBar from "@/components/directory/SearchBar";
import FilteredListingGrid from "@/components/directory/FilteredListingGrid";

export const metadata: Metadata = {
  title: "Yoga Workshops & Events",
  description: "Find yoga workshops, intensives, and special events near you and worldwide. Deepen your practice with expert teachers.",
};

export default async function WorkshopsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "workshop")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);

  const workshops: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              Services — Events
            </p>
            <h1 className="font-serif text-display-md text-on-surface mb-4">
              Workshops &amp; Events
            </h1>
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-8">
              Deepen your practice, meet new teachers, and connect with the community. Browse upcoming yoga workshops and special events worldwide.
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
        emptyTitle="Events coming soon"
        emptyDescription="Running a yoga workshop or event? Get it in front of the community."
        emptyCta="List Your Event"
      />
    </>
  );
}
