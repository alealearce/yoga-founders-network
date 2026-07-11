import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/supabase/types";
import { SITE, DEFAULT_OG_IMAGE } from "@/lib/config/site";
import { Clock, Calendar, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

const CATEGORY_TO_LISTING: Record<string, { slug: string; label: string }> = {
  finding_yoga:   { slug: "yogastudio",   label: "Yoga Studios" },
  studio_guides:  { slug: "yogastudio",   label: "Yoga Studios" },
  teacher_guides: { slug: "yogateacher",  label: "Yoga Teachers" },
  wellness:       { slug: "retreatcenter", label: "Retreat Centers" },
  yoga_lifestyle: { slug: "yogaproducts", label: "Yoga Products" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase  = await createClient();

  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, cover_image, author, meta_title, meta_description, published_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return { title: "Post Not Found" };

  const metaTitle = data.meta_title ?? data.title;
  const metaDesc = data.meta_description ?? data.excerpt ?? `Read "${data.title}" on ${SITE.name}`;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: { canonical: `${SITE.url}/community/${slug}` },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `${SITE.url}/community/${slug}`,
      siteName: SITE.name,
      locale: "en_US",
      type: "article",
      publishedTime: data.published_at ?? undefined,
      images: data.cover_image ? [{ url: data.cover_image }] : [DEFAULT_OG_IMAGE],
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
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  const post: BlogPost | null = postRes.data;
  if (!post) notFound();

  const related: BlogPost[] = relatedRes.data ?? [];

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : new Date(post.created_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.published_at ?? post.created_at,
    url: `${SITE.url}/community/${slug}`,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/images/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/community/${slug}`,
    },
    ...(post.cover_image ? { image: post.cover_image } : {}),
    ...(post.author ? { author: { "@type": "Person", name: post.author } } : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "The Journal", item: `${SITE.url}/community` },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Back nav */}
      <div className="pt-24 pb-4 bg-bg">
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
      <article className="bg-bg">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">

          {/* Category + city tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.category && (
              <span className="px-3 py-1 rounded-full bg-secondary-container text-primary font-sans text-xs font-bold">
                {post.category.replace(/_/g, " ")}
              </span>
            )}
            {post.city && (
              <span className="px-3 py-1 rounded-full bg-secondary-container text-primary font-sans text-xs font-bold">
                {post.city}
              </span>
            )}
            {post.tags?.length > 0 && post.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-secondary-container text-primary font-sans text-xs font-bold"
              >
                {tag}
              </span>
            ))}
          </div>

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
              {date}
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
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Body — proper markdown rendering */}
          <div
            className="prose prose-lg max-w-none font-sans text-on-surface-variant
              prose-headings:font-serif prose-headings:text-on-surface
              prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-outline-variant/20
              prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:mb-5
              prose-ul:my-6 prose-ul:pl-6 prose-ol:my-6 prose-ol:pl-6 prose-li:my-2 prose-li:leading-relaxed
              prose-hr:border-outline-variant/20 prose-hr:my-8
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-on-surface prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
          />

          {/* Directory CTA */}
          {(() => {
            const dir = CATEGORY_TO_LISTING[post.category ?? ""];
            if (!dir) return null;
            return (
              <div className="mt-10 p-6 bg-surface-low rounded-2xl border border-outline-variant/10">
                <p className="font-serif text-lg text-on-surface mb-1">
                  Looking for {dir.label}?
                </p>
                <p className="font-sans text-sm text-on-surface-variant mb-4">
                  Browse verified {dir.label.toLowerCase()} from around the world on {SITE.name}.
                </p>
                <Link
                  href={`/${dir.slug}`}
                  className="inline-flex items-center gap-1.5 bg-primary text-white font-sans text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                >
                  Browse {dir.label} &rarr;
                </Link>
              </div>
            );
          })()}
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
                  className="group block bg-surface-card rounded-2xl overflow-hidden hover:shadow-card transition-all duration-400"
                >
                  <div className="relative h-48 bg-surface-low overflow-hidden">
                    {p.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.cover_image}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-[600ms]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🪷</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg text-on-surface group-hover:text-primary transition-colors duration-300 leading-snug">
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

// Lightweight markdown → HTML converter (XSS-safe)
function markdownToHtml(md: string): string {
  if (!md) return "";

  // Strip raw HTML tags for XSS prevention
  let text = md.replace(/<[^>]*>/g, "");

  // Inline formatting — safe patterns only
  const inline = (s: string): string =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(
        /\[(.+?)\]\((https?:\/\/[^)\s]+)\)/g,
        '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>',
      )
      .replace(
        /\[(.+?)\]\(\/([^)\s]+)\)/g,
        '<a href="/$2">$1</a>',
      );

  const lines = text.split("\n");
  const output: string[] = [];
  let listType = "";
  const paraLines: string[] = [];

  const flushPara = () => {
    if (paraLines.length > 0) {
      output.push(`<p>${paraLines.join(" ")}</p>`);
      paraLines.length = 0;
    }
  };

  const closeList = () => {
    if (listType) {
      output.push(`</${listType}>`);
      listType = "";
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^---+$/.test(trimmed)) { flushPara(); closeList(); output.push("<hr>"); continue; }
    if (/^### /.test(trimmed)) { flushPara(); closeList(); output.push(`<h3>${inline(trimmed.slice(4))}</h3>`); continue; }
    if (/^## /.test(trimmed))  { flushPara(); closeList(); output.push(`<h2>${inline(trimmed.slice(3))}</h2>`); continue; }
    if (/^# /.test(trimmed))   { flushPara(); closeList(); output.push(`<h1>${inline(trimmed.slice(2))}</h1>`); continue; }

    if (/^[-*] /.test(trimmed)) {
      flushPara();
      if (listType !== "ul") { closeList(); output.push("<ul>"); listType = "ul"; }
      output.push(`<li>${inline(trimmed.slice(2))}</li>`);
      continue;
    }

    if (/^\d+\. /.test(trimmed)) {
      flushPara();
      if (listType !== "ol") { closeList(); output.push("<ol>"); listType = "ol"; }
      output.push(`<li>${inline(trimmed.replace(/^\d+\. /, ""))}</li>`);
      continue;
    }

    if (trimmed === "") { flushPara(); closeList(); continue; }

    if (listType) closeList();
    paraLines.push(inline(trimmed));
  }

  flushPara();
  closeList();

  return output.join("\n");
}
