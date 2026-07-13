import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/supabase/types";
import { SITE, DEFAULT_OG_IMAGE } from "@/lib/config/site";
import YogaSilhouette from "@/components/ui/YogaSilhouette";

const BLOG_CATEGORIES = [
  { id: "mission",           label: "Yoga's Impact" },
  { id: "finding_yoga",      label: "Finding Yoga" },
  { id: "studio_guides",     label: "Studio Guides" },
  { id: "teacher_guides",    label: "Teacher Guides" },
  { id: "wellness",          label: "Wellness" },
  { id: "yoga_lifestyle",    label: "Yoga Lifestyle" },
  { id: "founder_story",     label: "Member Spotlight" },
];

// Falls back to a de-slugged category id for any category not in the list above.
function categoryLabel(id: string): string {
  return BLOG_CATEGORIES.find((c) => c.id === id)?.label ?? id.replace(/_/g, " ");
}

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `The Journal — ${SITE.name}`,
  description: "Insights, guides, and wisdom for yoga students — how to find the right studio, choose a teacher, deepen your practice, and more.",
  alternates: { canonical: `${SITE.url}/community` },
  openGraph: {
    title: `The Journal — ${SITE.name}`,
    description: "Insights, guides, and wisdom for yoga students — how to find the right studio, choose a teacher, deepen your practice, and more.",
    url: `${SITE.url}/community`,
    images: [DEFAULT_OG_IMAGE],
    siteName: SITE.name,
    locale: "en_US",
    type: "website",
  },
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = await createClient();

  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(25);

  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }

  const { data } = await query;

  const posts: BlogPost[] = data ?? [];
  const featured = posts[0] ?? null;
  const rest     = posts.slice(1);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
            Stories &amp; Wisdom
          </p>
          <h1 className="font-serif text-display-md text-on-surface mb-4">
            The Journal
          </h1>
          <p className="font-sans text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Insights, studio spotlights, and wisdom from the global yoga community — curated for practitioners and founders alike.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="pb-8 bg-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/community"
              className={`px-4 py-1.5 rounded-[2px] font-sans text-sm font-medium border transition-colors ${
                !searchParams.category
                  ? "bg-primary text-white border-primary"
                  : "border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary"
              }`}
            >
              All
            </Link>
            {BLOG_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/community?category=${cat.id}`}
                className={`px-4 py-1.5 rounded-[2px] font-sans text-sm font-medium border transition-colors ${
                  searchParams.category === cat.id
                    ? "bg-primary text-white border-primary"
                    : "border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featured ? (
        <section className="pb-16 bg-bg">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Link
              href={`/community/${featured.slug}`}
              className="group block bg-surface-card rounded-2xl overflow-hidden hover:shadow-card transition-all duration-400 border border-outline-variant/10 p-8 lg:p-12"
            >
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase">
                    Featured Story
                  </p>
                  {featured.category && (
                    <span className="px-3 py-1 rounded-full bg-secondary-container font-sans text-xs font-bold text-primary">
                      {categoryLabel(featured.category)}
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-display-sm text-on-surface group-hover:text-primary transition-colors duration-300 leading-tight mb-4">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="font-sans text-base text-on-surface-variant leading-relaxed mb-6 line-clamp-3">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 font-sans text-sm text-on-surface-variant">
                  <span className="font-medium">{featured.author}</span>
                  {featured.reading_time_minutes && (
                    <>
                      <span>·</span>
                      <span>{featured.reading_time_minutes} min read</span>
                    </>
                  )}
                  {featured.published_at && (
                    <>
                      <span>·</span>
                      <span>
                        {new Date(featured.published_at).toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </section>
      ) : (
        <section className="pb-16 bg-bg">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-surface-card rounded-2xl p-16 text-center border border-outline-variant/10">
              <div className="flex justify-center mb-4"><YogaSilhouette pose="seated" size={48} /></div>
              <h2 className="font-serif text-xl text-on-surface mb-2">
                Stories coming soon
              </h2>
              <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto">
                We&apos;re gathering wisdom from the global yoga community. Check back soon.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Post Grid */}
      {rest.length > 0 && (
        <section className="pb-20 lg:pb-24 bg-bg">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function BlogPostCard({ post }: { post: BlogPost }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : "";

  return (
    <Link
      href={`/community/${post.slug}`}
      className="group block bg-surface-card rounded-2xl overflow-hidden hover:shadow-card transition-all duration-400"
    >
      <div className="p-5 pt-6">
        {post.category && (
          <span className="inline-block mb-3 px-2.5 py-1 rounded-full bg-secondary-container font-sans text-xs font-bold text-primary">
            {categoryLabel(post.category)}
          </span>
        )}
        <h3 className="font-serif text-lg text-on-surface group-hover:text-primary transition-colors duration-300 leading-snug mb-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 font-sans text-xs text-on-surface-variant">
          <span className="font-medium">{post.author}</span>
          {post.reading_time_minutes && (
            <>
              <span>·</span>
              <span>{post.reading_time_minutes} min read</span>
            </>
          )}
          {date && (
            <>
              <span>·</span>
              <span>{date}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
