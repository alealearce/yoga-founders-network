import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import ListingCard from "@/components/directory/ListingCard";
import SearchBar from "@/components/directory/SearchBar";
import YogaSilhouette from "@/components/ui/YogaSilhouette";

export const metadata: Metadata = {
  title: "Yoga Workshops & Events",
  description: "Find yoga workshops, intensives, and special events near you and worldwide. Deepen your practice with expert teachers.",
};

const FORMAT_FILTERS = ["All", "In-Person", "Online", "Hybrid", "Intensive", "Day Workshop", "Weekend"];

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
      <section className="pt-32 pb-16 bg-[#fafaf5]">
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

      {/* Format Filters */}
      <section className="py-4 bg-[#fafaf5] border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {FORMAT_FILTERS.map((f, i) => (
              <span
                key={f}
                className={`px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-all duration-300 cursor-pointer ${
                  i === 0
                    ? "bg-primary text-white"
                    : "bg-surface-low text-on-surface-variant hover:bg-secondary-container hover:text-primary"
                }`}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 lg:py-20 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {workshops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.map(workshop => (
                <ListingCard
                  key={workshop.id}
                  id={workshop.id}
                  slug={workshop.slug}
                  name={workshop.name}
                  type={workshop.type}
                  tagline={workshop.tagline ?? undefined}
                  city={workshop.city ?? undefined}
                  country={workshop.country ?? undefined}
                  logo_url={workshop.logo_url}
                  images={workshop.images}
                  yoga_styles={workshop.yoga_styles}
                  rating_avg={workshop.rating_avg}
                  rating_count={workshop.rating_count}
                  is_verified={workshop.is_verified}
                  is_featured={workshop.is_featured}
                  price_range={workshop.price_range}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="flex justify-center mb-4"><YogaSilhouette pose="warrior" size={64} color="#c5c8bd" /></div>
              <h3 className="font-serif text-xl text-on-surface mb-2">
                Events coming soon
              </h3>
              <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
                Running a yoga workshop or event? Get it in front of the community.
              </p>
              <a
                href="/submit"
                className="inline-flex px-6 py-3 rounded-full font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
              >
                List Your Event
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
