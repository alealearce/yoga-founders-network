import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail, SITE } from "@/lib/config/site";
import { storyPhotos } from "@/lib/social/eligibility";
import type { Listing, BlogPost } from "@/lib/supabase/types";
import { ArrowLeft } from "lucide-react";
import SpotlightActions from "./SpotlightActions";

export const metadata: Metadata = {
  title: "Spotlight Preview — Admin",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

type SpotlightListing = Pick<
  Listing,
  | "id"
  | "name"
  | "type"
  | "city"
  | "country"
  | "email"
  | "founder_story"
  | "founder_images"
  | "images"
  | "story_post_id"
>;

type SpotlightPost = Pick<
  BlogPost,
  "id" | "slug" | "title" | "excerpt" | "content" | "cover_image" | "pull_quote" | "is_published" | "published_at"
>;

const TYPE_LABEL: Record<string, string> = {
  studio: "Studio",
  teacher: "Teacher",
  school: "School",
  retreat: "Retreat Center",
  product: "Product",
  workshop: "Workshop",
};

export default async function SpotlightPreviewPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/admin/spotlight/${id}`);
  if (!isAdminEmail(user.email)) redirect("/");

  const adminSupabase = createAdminClient();

  const { data: listingData } = await adminSupabase
    .from("listings")
    .select("id, name, type, city, country, email, founder_story, founder_images, images, story_post_id")
    .eq("id", id)
    .maybeSingle();

  if (!listingData) notFound();
  const listing = listingData as SpotlightListing;

  let post: SpotlightPost | null = null;
  if (listing.story_post_id) {
    const { data: postData } = await adminSupabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, content, cover_image, pull_quote, is_published, published_at")
      .eq("id", listing.story_post_id)
      .maybeSingle();
    post = (postData as SpotlightPost) ?? null;
  }

  const photos = storyPhotos(listing);
  const kind = TYPE_LABEL[listing.type] ?? "Member";

  return (
    <div className="min-h-screen bg-bg px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/admin?tab=stories"
          className="inline-flex items-center gap-2 font-sans text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to Stories
        </Link>

        <div className="mb-8">
          <h1 className="font-serif text-display-sm text-on-surface">{listing.name}</h1>
          <p className="font-sans text-sm text-on-surface-variant mt-1">
            {kind}
            {listing.city ? ` · ${listing.city}` : ""}
            {listing.country ? `, ${listing.country}` : ""}
          </p>
        </div>

        {!post ? (
          <div className="bg-surface-card border border-outline-variant rounded-[2px] p-8 text-center">
            <p className="font-sans text-sm text-on-surface-variant mb-5">
              No spotlight draft has been generated for this listing yet.
            </p>
            <div className="flex justify-center">
              <SpotlightActions listingId={listing.id} hasDraft={false} isPublished={false} />
            </div>
          </div>
        ) : (
          <>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] border font-sans text-xs font-semibold mb-6 ${
                post.is_published
                  ? "border-green-200 bg-green-100 text-green-700"
                  : "border-outline-variant text-accent-text"
              }`}
            >
              {post.is_published ? "Live" : "Preview — not yet published"}
            </div>

            <article className="bg-surface-card border border-outline-variant rounded-[2px] overflow-hidden mb-8">
              {post.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-6 sm:p-8">
                <h2 className="font-serif text-display-sm text-on-surface leading-tight mb-3">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="font-sans text-base text-on-surface-variant mb-6">
                    {post.excerpt}
                  </p>
                )}

                {post.pull_quote && (
                  <blockquote className="border-l-2 border-accent pl-4 my-6 font-serif italic text-lg text-on-surface">
                    &ldquo;{post.pull_quote}&rdquo;
                  </blockquote>
                )}

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
              </div>
            </article>

            {photos.length > 0 && (
              <div className="mb-8">
                <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent-text mb-3">
                  Social hero preview
                </p>
                <div className="w-[360px] max-w-full aspect-[4/5] overflow-hidden rounded-[2px] border border-outline-variant">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/social/image?type=story&slide=0&img=${encodeURIComponent(photos[0])}&name=${encodeURIComponent(listing.name)}&kind=${encodeURIComponent(kind)}&city=${encodeURIComponent(listing.city ?? "")}`}
                    alt="Social carousel hero preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <SpotlightActions
              listingId={listing.id}
              hasDraft={true}
              isPublished={post.is_published}
              liveUrl={post.is_published ? `${SITE.url}/community/${post.slug}` : undefined}
            />
          </>
        )}
      </div>
    </div>
  );
}

// Lightweight markdown → HTML converter (XSS-safe) — copied from
// app/[locale]/community/[slug]/page.tsx so the admin preview renders
// exactly what readers will see once published. That file is owned by
// another agent — keep this copy in sync manually if it changes.
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

    const imgMatch = trimmed.match(/^!\[(.*?)\]\((https?:\/\/[^)\s]+)\)$/);
    if (imgMatch) {
      flushPara();
      closeList();
      const alt = imgMatch[1].replace(/"/g, "&quot;");
      output.push(`<img src="${imgMatch[2]}" alt="${alt}" loading="lazy" decoding="async" class="rounded-[2px] border border-outline-variant/20 my-8 w-full" />`);
      continue;
    }

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
