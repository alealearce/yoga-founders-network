import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import { LISTING_TYPES } from "@/lib/config/site";
import Badge from "@/components/ui/Badge";

export const metadata = {
  title: "Search — Yoga Founders Network",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

function listingIcon(type: Listing["type"]): string {
  return LISTING_TYPES.find((t) => t.id === type)?.icon ?? "🧘";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, type } = await searchParams;
  const query = (q ?? "").trim();
  const typeFilter = type ?? "";

  let results: Listing[] = [];

  if (query || typeFilter) {
    const supabase = createAdminClient();
    let req = supabase
      .from("listings")
      .select("id, name, slug, type, tagline, city, country, is_verified, is_featured, rating_avg, rating_count, logo_url")
      .eq("status", "approved");

    if (typeFilter) {
      req = req.eq("type", typeFilter);
    }

    if (query) {
      req = req.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,tagline.ilike.%${query}%,city.ilike.%${query}%`
      );
    }

    const { data } = await req.order("is_featured", { ascending: false }).order("rating_avg", { ascending: false }).limit(48);
    results = (data ?? []) as Listing[];
  }

  return (
    <div className="min-h-screen bg-[#fafaf5] px-6 py-16">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-display-sm text-on-surface mb-2">
            {query ? `Results for "${query}"` : typeFilter ? `Browse ${typeFilter}` : "Search"}
          </h1>
          <p className="font-sans text-sm text-on-surface-variant">
            {results.length} {results.length === 1 ? "result" : "results"} found
            {typeFilter && (
              <> in <span className="font-semibold capitalize">{typeFilter}</span></>
            )}
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
            className={`inline-flex items-center px-4 py-1.5 rounded-full font-sans text-sm font-semibold transition-all duration-300 ${
              !typeFilter
                ? "text-white"
                : "bg-surface-low text-on-surface-variant hover:bg-secondary-container"
            }`}
            style={
              !typeFilter
                ? { background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }
                : undefined
            }
          >
            All
          </Link>
          {LISTING_TYPES.map((t) => {
            const isActive = typeFilter === t.id;
            const href = query
              ? `/search?q=${encodeURIComponent(query)}&type=${t.id}`
              : `/search?type=${t.id}`;
            return (
              <Link
                key={t.id}
                href={href}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-sans text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "bg-surface-low text-on-surface-variant hover:bg-secondary-container"
                }`}
                style={
                  isActive
                    ? { background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }
                    : undefined
                }
              >
                <span>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {results.length === 0 && (query || typeFilter) && (
          <div className="text-center py-24">
            <div className="text-5xl mb-5">🔍</div>
            <h2 className="font-serif text-xl text-on-surface mb-3">
              No results found
            </h2>
            <p className="font-sans text-sm text-on-surface-variant mb-8 max-w-sm mx-auto">
              Try a different search term or browse by category above.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-sans font-semibold text-sm text-white transition-all duration-300 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
            >
              Explore all listings
            </Link>
          </div>
        )}

        {/* No query */}
        {!query && !typeFilter && (
          <div className="text-center py-24">
            <div className="text-5xl mb-5">🧘</div>
            <h2 className="font-serif text-xl text-on-surface mb-3">
              What are you looking for?
            </h2>
            <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto">
              Enter a search term above or choose a category to browse.
            </p>
          </div>
        )}

        {/* Results grid */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((listing) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.slug}`}
                className="group bg-surface-card rounded-2xl shadow-card p-5 hover:shadow-float transition-all duration-300 flex gap-4"
              >
                {/* Icon / Logo */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface-low flex items-center justify-center text-2xl">
                  {listingIcon(listing.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-serif text-base text-on-surface group-hover:text-primary transition-colors truncate">
                      {listing.name}
                    </h3>
                    {listing.is_verified && (
                      <Badge variant="verified">Verified</Badge>
                    )}
                    {listing.is_featured && (
                      <Badge variant="featured">Featured</Badge>
                    )}
                  </div>

                  {listing.tagline && (
                    <p className="font-sans text-sm text-on-surface-variant line-clamp-2 mb-2">
                      {listing.tagline}
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="font-sans text-xs text-on-surface-variant capitalize">
                      {listing.type}
                    </span>
                    {listing.city && (
                      <>
                        <span className="text-outline-variant">·</span>
                        <span className="font-sans text-xs text-on-surface-variant">
                          {listing.city}
                          {listing.country ? `, ${listing.country}` : ""}
                        </span>
                      </>
                    )}
                    {listing.rating_count > 0 && (
                      <>
                        <span className="text-outline-variant">·</span>
                        <span className="font-sans text-xs text-on-surface-variant">
                          {listing.rating_avg.toFixed(1)} ★
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
