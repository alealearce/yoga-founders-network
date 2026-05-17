"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import type { Listing } from "@/lib/supabase/types";
import ListingCard from "@/components/directory/ListingCard";
import YogaSilhouette from "@/components/ui/YogaSilhouette";

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

interface FilterGroup {
  label?: string;
  options: readonly string[];
  field: "yoga_styles" | "experience_levels";
}

interface FilteredListingGridProps {
  listings: Listing[];
  filterGroups: FilterGroup[];
  columns?: "3" | "4";
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCta?: string;
}

export default function FilteredListingGrid({
  listings,
  filterGroups,
  columns = "3",
  emptyTitle = "Coming soon",
  emptyDescription = "Be the first to list here.",
  emptyCta = "List Your Space",
}: FilteredListingGridProps) {
  // One active filter per group; null = "All"
  const [activeFilters, setActiveFilters] = useState<Record<string, string | null>>(
    Object.fromEntries(filterGroups.map(g => [g.field, null]))
  );
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "requesting" | "denied" | "unsupported">("idle");

  const requestNearMe = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("unsupported");
      return;
    }
    setGeoState("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoState("idle");
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  };

  const toggle = (field: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [field]: prev[field] === value ? null : value }));
  };

  const baseFiltered = listings.filter(listing =>
    filterGroups.every(group => {
      const active = activeFilters[group.field];
      if (!active) return true;
      const values: string[] = (listing[group.field] as string[] | null) ?? [];
      return values.includes(active);
    })
  );

  const filtered = useMemo(() => {
    if (!userCoords) return baseFiltered;
    return [...baseFiltered]
      .map((l) => {
        const distance =
          typeof l.latitude === "number" && typeof l.longitude === "number"
            ? haversineKm(userCoords, { lat: l.latitude, lon: l.longitude })
            : null;
        return { listing: l, distance };
      })
      .sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      })
      .map(({ listing, distance }) => ({ ...listing, _distance: distance } as Listing & { _distance: number | null }));
  }, [baseFiltered, userCoords]);

  const gridCols = columns === "4"
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      {/* Filter bars */}
      <section className="py-4 bg-[#ffffff] border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-3">
          {/* Near me toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={requestNearMe}
              disabled={geoState === "requesting" || !!userCoords}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-all duration-300 ${
                userCoords
                  ? "bg-primary text-white"
                  : "bg-surface-low text-on-surface-variant hover:bg-secondary-container hover:text-primary"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <MapPin size={13} />
              {userCoords
                ? "Sorted by distance"
                : geoState === "requesting"
                ? "Locating…"
                : "Sort by distance"}
            </button>
            {userCoords && (
              <button
                onClick={() => setUserCoords(null)}
                className="font-sans text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                Reset
              </button>
            )}
            {geoState === "denied" && (
              <span className="font-sans text-xs text-on-surface-variant/70">
                Location denied — enable it in your browser to sort by distance.
              </span>
            )}
            {geoState === "unsupported" && (
              <span className="font-sans text-xs text-on-surface-variant/70">
                Geolocation isn&apos;t supported in this browser.
              </span>
            )}
          </div>

          {filterGroups.map(group => (
            <div key={group.field} className="flex flex-wrap gap-2">
              {group.label && (
                <span className="font-sans text-xs text-on-surface-variant self-center mr-1">
                  {group.label}
                </span>
              )}
              <button
                onClick={() => setActiveFilters(prev => ({ ...prev, [group.field]: null }))}
                className={`px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-all duration-300 ${
                  activeFilters[group.field] === null
                    ? "bg-primary text-white"
                    : "bg-surface-low text-on-surface-variant hover:bg-secondary-container hover:text-primary"
                }`}
              >
                {group.label ? "All" : "All Styles"}
              </button>
              {group.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggle(group.field, opt)}
                  className={`px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-all duration-300 ${
                    activeFilters[group.field] === opt
                      ? "bg-primary text-white"
                      : "bg-surface-low text-on-surface-variant hover:bg-secondary-container hover:text-primary"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 lg:py-20 bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {filtered.length > 0 ? (
            <div className={`grid ${gridCols} gap-6`}>
              {filtered.map(listing => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  slug={listing.slug}
                  name={listing.name}
                  type={listing.type}
                  tagline={listing.tagline ?? undefined}
                  city={listing.city ?? undefined}
                  country={listing.country ?? undefined}
                  logo_url={listing.logo_url}
                  images={listing.images}
                  yoga_styles={listing.yoga_styles}
                  rating_avg={listing.rating_avg}
                  rating_count={listing.rating_count}
                  is_verified={listing.is_verified}
                  is_featured={listing.is_featured}
                  price_range={listing.price_range}
                  distance_km={(listing as Listing & { _distance?: number | null })._distance ?? null}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="flex justify-center mb-4">
                <YogaSilhouette pose="warrior" size={64} color="#d0d0d0" />
              </div>
              <h3 className="font-serif text-xl text-on-surface mb-2">{emptyTitle}</h3>
              <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
                {emptyDescription}
              </p>
              <a
                href="/submit"
                className="inline-flex px-6 py-3 rounded-full font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#111111" }}
              >
                {emptyCta}
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
