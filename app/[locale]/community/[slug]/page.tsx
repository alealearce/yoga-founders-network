import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/supabase/types";
import { SITE } from "@/lib/config/site";
import { Clock, Calendar, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase  = await createClient();

  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, cover_image, author")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return { title: "Post Not Found" };

  return {
    title: data.title,
    description: data.excerpt ?? `Read "${data.title}" on ${SITE.name}`,
    openGraph: {
      title: data.title,
      description: data.excerpt ?? "",
      images: data.cover_image ? [{ url: data.cover_image }] : [],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase  = await createClient();

  const [postRes, relatedRes] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single(),
    supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .neq("slug", slug)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const post: BlogPost | null = postRes.data;
  if (!post) notFound();

  const related: BlogPost[] = relatedRes.data ?? [];

  return (
    <>
      {/* Back nav */}
      <div className="pt-24 pb-4 bg-[#fafaf5]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 font-sans text-sm text-on-surface-variant hover:text-on-surface transition-colors duration-300"
          >
            <ArrowLeft size={14} />
            Back to The Journal
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="bg-[#fafaf5]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-secondary-container text-primary font-sans text-xs font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-serif text-display-md text-on-surface leading-tight mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-sans text-sm font-bold text-primary">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <span className="font-sans text-sm font-semibold text-on-surface">
                {post.author}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-sans text-sm text-on-surface-variant">
              <Calendar size={13} />
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </div>
            {post.reading_time_minutes && (
              <div className="flex items-center gap-1.5 font-sans text-sm text-on-surface-variant">
                <Clock size={13} />
                {post.reading_time_minutes} min read
              </div>
            )}
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div
              className="relative w-full overflow-hidden mb-10"
              style={{
                height: "clamp(200px, 35vw, 480px)",
                borderRadius: "1.5rem 1.5rem 1.5rem 0",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Body */}
          <div className="prose prose-lg max-w-none font-sans text-on-surface-variant prose-headings:font-serif prose-headings:text-on-surface prose-a:text-primary prose-strong:text-on-surface">
            {post.content.split("\n\n").map((block, i) => {
              if (block.startsWith("## ")) {
                return (
                  <h2 key={i} className="font-serif text-2xl font-bold text-on-surface mt-10 mb-4">
                    {block.replace("## ", "")}
                  </h2>
                );
              }
              if (block.startsWith("### ")) {
                return (
                  <h3 key={i} className="font-serif text-xl font-bold text-on-surface mt-8 mb-3">
                    {block.replace("### ", "")}
                  </h3>
                );
              }
              return (
                <p key={i} className="font-sans text-base text-on-surface-variant leading-relaxed mb-5">
                  {block}
                </p>
              );
            })}
          </div>
        </div>
      </article>

      {/* More from the Journal */}
      {related.length > 0 && (
        <section className="py-20 bg-surface-low">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="font-serif text-display-sm text-on-surface mb-10">
              More from The Journal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(p => (
                <Link
                  key={p.id}
                  href={`/community/${p.slug}`}
                  className="group block bg-surface-card rounded-2xl overflow-hidden hover:shadow-card transition-all duration-400 hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-surface-low overflow-hidden">
                    {p.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[600ms]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🪷</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors duration-300 leading-snug">
                      {p.title}
                    </h3>
                    <p className="font-sans text-xs text-on-surface-variant mt-2">
                      {p.author}{p.reading_time_minutes ? ` · ${p.reading_time_minutes} min read` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
