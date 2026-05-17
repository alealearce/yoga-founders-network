import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getIpLocation } from "@/lib/utils/ipLocation";
import type { Listing } from "@/lib/supabase/types";
import { PRODUCT_CATEGORIES } from "@/lib/config/categories";
import SearchBar from "@/components/directory/SearchBar";
import FilteredListingGrid from "@/components/directory/FilteredListingGrid";

export const metadata: Metadata = {
  title: "Yoga Products",
  description: "Shop yoga mats, props, apparel, books, and more from trusted yoga brands and independent creators worldwide.",
};

export default async function ProductsPage() {
  const [supabase, ipLocation] = await Promise.all([
    createClient(),
    getIpLocation(),
  ]);

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "product")
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .limit(500);

  const products: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              Services — Products
            </p>
            <h1 className="font-serif text-display-md text-on-surface mb-4">
              Yoga Products
            </h1>
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-8">
              From premium mats to digital courses, discover yoga products curated by the community — for the community.
            </p>
            {total > 0 && (
              <p className="font-sans text-sm text-on-surface-variant/70 mb-6">
                {total.toLocaleString()} product{total !== 1 ? "s" : ""} listed
              </p>
            )}
          </div>
          <SearchBar
            initialType="product"
            showFilters={false}
            placeholder="Search yoga products..."
          />
        </div>
      </section>

      <FilteredListingGrid
        listings={products}
        columns="4"
        filterGroups={[
          { label: "Category:", field: "experience_levels", options: [...PRODUCT_CATEGORIES] },
        ]}
        ipLocation={ipLocation}
        emptyTitle="Products coming soon"
        emptyDescription="Sell yoga products? List them in our community marketplace."
        emptyCta="List Your Product"
      />
    </>
  );
}
