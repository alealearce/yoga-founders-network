import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/supabase/types";
import { YOGA_CATEGORIES, EXPERIENCE_LEVELS } from "@/lib/config/categories";
import ListingCard from "@/components/directory/ListingCard";
import SearchBar from "@/components/directory/SearchBar";

export const metadata: Metadata = {
  title: "Yoga Teachers",
  description: "Find experienced yoga teachers worldwide. Browse teachers by style, experience level, and location — from local guides to internationally renowned instructors.",
};

export default async function TeachersPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("type", "teacher")
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .limit(24);

  const teachers: Listing[] = data ?? [];
  const total = count ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
              The Directory
            </p>
            <h1 className="font-serif text-display-md text-on-surface mb-4">
              Find Your Teacher
            </h1>
            <p className="font-sans text-lg text-on-surface-variant leading-relaxed mb-8">
              Connect with yoga teachers who inspire. From beginners&apos; guides to advanced practitioners — find the right teacher for your journey.
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

      {/* Filters */}
      <section className="py-4 bg-[#fafaf5] border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-3">
          {/* Style filter */}
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-1.5 rounded-full bg-primary text-white font-sans text-sm font-medium">
              All Styles
            </span>
            {YOGA_CATEGORIES.slice(0, 8).map(cat => (
              <span
                key={cat.id}
                className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant font-sans text-sm font-medium hover:bg-secondary-container hover:text-primary transition-all duration-300 cursor-pointer"
              >
                {cat.icon} {cat.label}
              </span>
            ))}
          </div>
          {/* Experience filter */}
          <div className="flex flex-wrap gap-2">
            <span className="font-sans text-xs text-on-surface-variant self-center mr-1">Level:</span>
            {EXPERIENCE_LEVELS.map(level => (
              <span
                key={level}
                className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant font-sans text-sm font-medium hover:bg-secondary-container hover:text-primary transition-all duration-300 cursor-pointer"
              >
                {level}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 lg:py-20 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Suspense fallback={<GridSkeleton />}>
            {teachers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teachers.map(teacher => (
                  <ListingCard
                    key={teacher.id}
                    id={teacher.id}
                    slug={teacher.slug}
                    name={teacher.name}
                    type={teacher.type}
                    tagline={teacher.tagline ?? undefined}
                    city={teacher.city ?? undefined}
                    country={teacher.country ?? undefined}
                    logo_url={teacher.logo_url}
                    images={teacher.images}
                    yoga_styles={teacher.yoga_styles}
                    rating_avg={teacher.rating_avg}
                    rating_count={teacher.rating_count}
                    is_verified={teacher.is_verified}
                    is_featured={teacher.is_featured}
                    price_range={teacher.price_range}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">👤</div>
                <h3 className="font-serif text-xl text-on-surface mb-2">
                  Teachers coming soon
                </h3>
                <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
                  Know an inspiring yoga teacher? Help them get discovered.
                </p>
                <a
                  href="/submit"
                  className="inline-flex px-6 py-3 rounded-full font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
                >
                  List a Teacher
                </a>
              </div>
            )}
          </Suspense>
        </div>
      </section>
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-surface-card rounded-2xl overflow-hidden animate-pulse">
          <div className="h-52 bg-surface-low" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-surface-low rounded-full w-1/3" />
            <div className="h-5 bg-surface-low rounded-full w-3/4" />
            <div className="h-3 bg-surface-low rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
