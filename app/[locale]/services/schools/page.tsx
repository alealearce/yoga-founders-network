import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import ListingCard from "@/components/directory/ListingCard";
import SearchBar from "@/components/directory/SearchBar";

export const metadata: Metadata = {
  title: "Teacher Training & Yoga Schools",
  description: "Find accredited yoga teacher training programs and schools worldwide. Browse 200hr, 300hr, and 500hr certifications across all yoga traditions.",
};

const DURATION_FILTERS = ["200hr", "300hr", "500hr", "Weekend", "Immersive"];

export default async function SchoolsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "school")
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .limit(24);

  const schools: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#fafaf5]">
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

      {/* Duration Filters */}
      <section className="py-4 bg-[#fafaf5] border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <span className="font-sans text-xs text-on-surface-variant self-center mr-2">
              Duration:
            </span>
            <span className="px-4 py-1.5 rounded-full bg-primary text-white font-sans text-sm font-medium">
              All
            </span>
            {DURATION_FILTERS.map(d => (
              <span
                key={d}
                className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant font-sans text-sm font-medium hover:bg-secondary-container hover:text-primary transition-all duration-300 cursor-pointer"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 lg:py-20 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {schools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map(school => (
                <ListingCard
                  key={school.id}
                  id={school.id}
                  slug={school.slug}
                  name={school.name}
                  type={school.type}
                  tagline={school.tagline ?? undefined}
                  city={school.city ?? undefined}
                  country={school.country ?? undefined}
                  logo_url={school.logo_url}
                  images={school.images}
                  yoga_styles={school.yoga_styles}
                  rating_avg={school.rating_avg}
                  rating_count={school.rating_count}
                  is_verified={school.is_verified}
                  is_featured={school.is_featured}
                  price_range={school.price_range}
                />
              ))}
            </div>
          ) : (
            <EmptyServiceState
              icon="🎓"
              title="Teacher training programs coming soon"
              description="We are building a curated directory of the world's best yoga teacher training schools. Know a great one? Submit it."
              cta="List Your School"
            />
          )}
        </div>
      </section>
    </>
  );
}

function EmptyServiceState({
  icon, title, description, cta,
}: {
  icon: string; title: string; description: string; cta: string;
}) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-serif text-xl text-on-surface mb-2">{title}</h3>
      <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
        {description}
      </p>
      <a
        href="/submit"
        className="inline-flex px-6 py-3 rounded-full font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
      >
        {cta}
      </a>
    </div>
  );
}
