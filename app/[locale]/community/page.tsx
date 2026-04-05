import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/supabase/types";
import { SITE } from "@/lib/config/site";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";

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
              <div className="text-5xl mb-4">📖</div>
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
