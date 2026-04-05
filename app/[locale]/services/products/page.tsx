import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import { PRODUCT_TYPES } from "@/lib/config/categories";
import ListingCard from "@/components/directory/ListingCard";
import SearchBar from "@/components/directory/SearchBar";

export const metadata: Metadata = {
  title: "Yoga Products",
  description: "Shop yoga mats, props, apparel, books, and more from trusted yoga brands and independent creators worldwide.",
};

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "product")
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .limit(24);

  const products: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#fafaf5]">
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

      {/* Category Filters */}
      <section className="py-4 bg-[#fafaf5] border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-1.5 rounded-full bg-primary text-white font-sans text-sm font-medium">
              All Products
            </span>
            {PRODUCT_TYPES.map(type => (
              <span
                key={type}
                className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant font-sans text-sm font-medium hover:bg-secondary-container hover:text-primary transition-all duration-300 cursor-pointer"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 lg:py-20 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ListingCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  type={product.type}
                  tagline={product.tagline ?? undefined}
                  city={product.city ?? undefined}
                  country={product.country ?? undefined}
                  logo_url={product.logo_url}
                  images={product.images}
                  yoga_styles={product.yoga_styles}
                  rating_avg={product.rating_avg}
                  rating_count={product.rating_count}
                  is_verified={product.is_verified}
                  is_featured={product.is_featured}
                  price_range={product.price_range}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🪷</div>
              <h3 className="font-serif text-xl text-on-surface mb-2">
                Products coming soon
              </h3>
              <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
                Sell yoga products? List them in our community marketplace.
              </p>
              <a
                href="/submit"
                className="inline-flex px-6 py-3 rounded-full font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
              >
                List Your Product
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
