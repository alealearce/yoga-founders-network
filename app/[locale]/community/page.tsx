import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/supabase/types";
import { SITE } from "@/lib/config/site";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";
import YogaSilhouette from "@/components/ui/YogaSilhouette";

const RESOURCES = [
  { href: "/resources/email-generator",         title: "Re-Engagement Email Generator",   desc: "Win back dormant students with a 7-email sequence tailored to your studio's tone and offer." },
  { href: "/resources/retreat-checklist",        title: "Retreat Planning Checklist",      desc: "Generate a personalized step-by-step checklist for planning your next yoga retreat." },
  { href: "/resources/class-theme-generator",   title: "Class Theme Generator",            desc: "Never run out of class ideas — get intentions, peak poses, playlist vibes, and more." },
  { href: "/resources/wellness-planner",         title: "Yoga & Wellness Planner",         desc: "Build a personalized morning yoga routine and meal plan based on your lifestyle." },
  { href: "/resources/teacher-finder",           title: "Find Your Perfect Teacher",       desc: "Answer a few questions and get matched with the right yoga teacher for your goals." },
  { href: "/resources/studio-name-generator",    title: "Studio Name Generator",          desc: "Discover the perfect name for your studio with domain suggestions and taglines." },
  { href: "/resources/profitability-calculator", title: "Profitability Calculator",        desc: "Understand your studio's true financial health and get actionable improvement tips." },
];

export const metadata: Metadata = {
  title: "The Journal",
  description: "Insights, stories, and wisdom from the global yoga community. Studio spotlights, founder interviews, practice guides, and more.",
};

export default async function CommunityPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(13);

  const posts: BlogPost[] = data ?? [];
  const featured = posts[0] ?? null;
  const rest     = posts.slice(1);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
            Stories &amp; Wisdom
          </p>
          <h1 className="font-serif text-display-md text-on-surface mb-4">
            The Journal
          </h1>
          <p className="font-sans text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Insights, studio spotlights, and wisdom from the global yoga community — curated for founders and practitioners alike.
          </p>
        </div>
      </section>

      {/* Resources Section */}
      <section className="pb-16 bg-[#fafaf5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-2">
                Tools &amp; Guides
              </p>
              <h2 className="font-serif text-display-sm text-on-surface">
                Resources
              </h2>
            </div>
            <Link
              href="/resources"
              className="hidden sm:flex font-sans text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RESOURCES.map(resource => (
              <Link
                key={resource.href}
                href={resource.href}
                className="group flex flex-col bg-surface-card rounded-2xl p-6 hover:shadow-card transition-all duration-400 hover:-translate-y-1 border border-outline-variant/10"
              >
                <h3 className="font-serif text-base font-bold text-on-surface group-hover:text-primary transition-colors duration-300 leading-snug mb-2">
                  {resource.title}
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed flex-1">
                  {resource.desc}
                </p>
                <div className="mt-4 flex items-center gap-1 font-sans text-xs font-semibold text-primary">
                  Try it free
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </Link>
            ))}
            {/* Coming Soon slot */}
            <div className="flex flex-col bg-surface-low rounded-2xl p-6 border border-outline-variant/10 border-dashed">
              <h3 className="font-serif text-base font-bold text-on-surface-variant leading-snug mb-2">
                More Coming Soon
              </h3>
              <p className="font-sans text-sm text-on-surface-variant/60 leading-relaxed">
                New tools and guides are added regularly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featured ? (
        <section className="pb-16 bg-[#fafaf5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Link
              href={`/community/${featured.slug}`}
              className="group block bg-surface-card rounded-2xl overflow-hidden hover:shadow-card transition-all duration-400"
            >
              <div className="grid lg:grid-cols-2">
                {/* Image */}
                <div className="relative h-72 lg:h-auto bg-surface-low overflow-hidden">
                  {featured.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.cover_image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">
                      🪷
                    </div>
                  )}
                  {featured.tags?.[0] && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-full bg-primary text-white font-sans text-xs font-bold">
                        {featured.tags[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-4">
                    Featured Story
                  </p>
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
                    <span>·</span>
                    <span>
                      {new Date(featured.created_at).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      ) : (
        <section className="pb-16 bg-[#fafaf5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-surface-card rounded-2xl p-16 text-center">
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
        <section className="pb-20 lg:pb-28 bg-[#fafaf5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-20 bg-surface-low">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-sans text-xs font-bold tracking-widest text-primary uppercase mb-3">
            Weekly Dispatches
          </p>
          <h2 className="font-serif text-display-sm text-on-surface mb-3">
            The Sanctuary Newsletter
          </h2>
          <p className="font-sans text-base text-on-surface-variant mb-8 leading-relaxed">
            Curated yoga wisdom, studio spotlights, and community stories — delivered to your inbox every week.
          </p>
          <NewsletterSignup variant="inline" />
        </div>
      </section>
    </>
  );
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/community/${post.slug}`}
      className="group block bg-surface-card rounded-2xl overflow-hidden hover:shadow-card transition-all duration-400 hover:-translate-y-1"
    >
      <div className="relative h-52 bg-surface-low overflow-hidden">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🪷
          </div>
        )}
        {post.tags?.[0] && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-primary text-white font-sans text-xs font-bold">
              {post.tags[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors duration-300 leading-snug mb-2">
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
        </div>
      </div>
    </Link>
  );
}
