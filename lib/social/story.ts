/**
 * story.ts — Founder Story pipeline orchestrator.
 *
 * On admin approval of a listing with a qualifying founder story (>=3 answered
 * questions + >=1 photo, not opted out), this:
 *   1. Generates a "Welcome + Member Spotlight" Journal post with Claude
 *      (mirrors app/api/admin/daily-blog/route.ts's forced-tool-use pattern).
 *   2. Inserts it into blog_posts (idempotent via listings.story_post_id).
 *   3. Publishes a 4-slide carousel via Blotato (mirrors
 *      app/api/admin/daily-social/route.ts's uploadAll/publish/audit loop).
 *
 * Called from the admin approve route (and a manual retry action) — never a
 * cron. See FOUNDER-STORY-SPEC.md §4.4/§4.5 for the full contract.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/server';
import { SITE, FOUNDER_QUESTIONS, type FounderQuestionKey } from '@/lib/config/site';
import { buildStoryCaption } from '@/lib/social/caption';
import { configuredPlatforms, SINGLE_IMAGE_ONLY, uploadAll, publish, clampCaption, type Platform } from '@/lib/social/blotato';
import type { Listing } from '@/lib/supabase/types';

const MODEL = 'claude-sonnet-4-5-20250929';
const IMG_BASE = process.env.SOCIAL_PUBLIC_BASE_URL || SITE.url;

const TYPE_LABEL: Record<string, string> = {
  studio: 'Studio', teacher: 'Teacher', school: 'School', retreat: 'Retreat Center', product: 'Product', workshop: 'Workshop',
};

// ─────────────────────────────── eligibility ─────────────────────────────────
// Lives in lib/social/eligibility.ts (client-safe) so the admin UI shares the
// exact rule without pulling server-only imports into its bundle.

import { ineligibleReason, isStoryEligible, storyPhotos } from '@/lib/social/eligibility';
export { isStoryEligible };

// ─────────────────────────────── generation ──────────────────────────────────

type GeneratedStory = {
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  content: string;
  pull_quote: string;
};

const SYSTEM_PROMPT = `You are the automated editorial system for Yoga Founders Network (yogafoundersnetwork.com) — the global directory for yoga studios, teachers, schools, retreats, and products.

You are writing a "Welcome + Member Spotlight" post for a founder who just joined the network. This is NOT a "story" — never use the word "story" anywhere in the title or copy. The public framing is a welcome + spotlight.

VOICE: "the network" — warm, grounded, encouraging, inclusive. Like a knowledgeable practitioner who also understands the business side of yoga. Calm but authoritative. Never preachy. No emojis anywhere.

STRICT RULES
- Open the post by welcoming the founder to the network, then spotlight them from there.
- The title MUST follow a "Welcome to the Network: {Name}" or "Member Spotlight: {Name}" pattern. Never use the word "story".
- Weave the founder's own answers into the piece as direct quotes, inside quotation marks. Quote them VERBATIM — never paraphrase text that sits inside quote marks.
- If a question was not answered, skip that beat ENTIRELY. Never invent biographical facts, details, or quotes that weren't given to you.
- Close with a warm nod to their listing on Yoga Founders Network.
- 500–700 words of markdown. Clean structure: a short welcome intro, then the woven Q&A, then a closing.
- Where the user message gives you image URLs to embed, place each as its own markdown image line (\`![alt](url)\`) roughly evenly spaced between sections of the piece — never inside a paragraph of running text.

OUTPUT
Call the publish_spotlight tool with the finished post. pull_quote must be one full sentence lifted VERBATIM (word-for-word, no edits) from one of the founder's answers — it will be set as a pull-quote on a social graphic, so pick the most vivid, human line available.`;

const SPOTLIGHT_TOOL = {
  name: 'publish_spotlight',
  description: 'Publish the generated Welcome + Member Spotlight post with all required fields.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'Follows a "Welcome to the Network: {Name}" or "Member Spotlight: {Name}" pattern. Never the word "story".' },
      excerpt: { type: 'string', description: '1–2 sentence summary' },
      meta_title: { type: 'string', description: 'under 60 chars' },
      meta_description: { type: 'string', description: '130–155 chars' },
      content: { type: 'string', description: 'Full markdown body, 500–700 words' },
      pull_quote: { type: 'string', description: "One full sentence lifted VERBATIM from one of the founder's answers" },
    },
    required: ['title', 'excerpt', 'meta_title', 'meta_description', 'content', 'pull_quote'],
  },
};

function buildUserPrompt(listing: Listing, photos: string[]): string {
  const qas = FOUNDER_QUESTIONS
    .map((q) => {
      const answer = listing.founder_story?.[q.key as FounderQuestionKey];
      return answer && answer.trim() ? `Q: ${q.label}\nA: "${answer.trim()}"` : null;
    })
    .filter(Boolean)
    .join('\n\n');

  const loc = [listing.city, listing.country].filter(Boolean).join(', ');
  const embedImages = photos.slice(1, 3); // [0] is the cover photo, already shown above the post
  const imageInstruction = embedImages.length
    ? `Embed these image URL(s) as markdown images on their own line, spaced between sections of the piece:\n${embedImages.map((u) => `- ${u}`).join('\n')}`
    : 'No additional images to embed.';

  return `New member: ${listing.name}
Type: ${listing.type}
Location: ${loc || 'worldwide'}
About (from their listing): ${listing.description || listing.long_description || listing.tagline || '(no listing description provided)'}

Their answers to our 5 story questions (ONLY these are answered — do not address any question not listed here):

${qas || '(no answers provided)'}

${imageInstruction}

Write today's Welcome + Member Spotlight post per the system rules and call the publish_spotlight tool.`;
}

async function generateStoryPost(listing: Listing, photos: string[]): Promise<GeneratedStory> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [SPOTLIGHT_TOOL],
    tool_choice: { type: 'tool', name: 'publish_spotlight' },
    messages: [{ role: 'user', content: buildUserPrompt(listing, photos) }],
  });
  const toolBlock = message.content.find((b) => b.type === 'tool_use');
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    throw new Error(`Model did not return a spotlight post (stop_reason: ${message.stop_reason})`);
  }
  const post = toolBlock.input as GeneratedStory;
  if (!post?.title || !post?.content || !post?.pull_quote) {
    throw new Error('Model returned an incomplete spotlight post');
  }
  return post;
}

/** Guarantee the 2nd/3rd founder photos appear in the body — append them if the model dropped them. */
function ensureImagesEmbedded(content: string, images: string[], name: string): string {
  const extras = images.slice(1, 3);
  if (extras.length === 0) return content;
  const paragraphs = content.split(/\n\n+/);
  extras.forEach((url, i) => {
    if (content.includes(url)) return; // already embedded by the model
    const md = `![${name}](${url})`;
    const insertAt = Math.max(1, Math.floor((paragraphs.length * (i + 1)) / (extras.length + 2)));
    paragraphs.splice(insertAt, 0, md);
  });
  return paragraphs.join('\n\n');
}

function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function truncate(text: string, max: number): string {
  const t = (text || '').trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

// ──────────────────────────────── blog insert ─────────────────────────────────

async function insertPostWithUniqueSlug(
  supabase: ReturnType<typeof createAdminClient>,
  baseSlug: string,
  row: Record<string, unknown>
): Promise<{ id: string; slug: string } | { error: string }> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({ ...row, slug })
      .select('id, slug')
      .single();
    if (!error && data) return data as { id: string; slug: string };
    if (error && error.code !== '23505') return { error: error.message }; // not a unique-violation — stop retrying
  }
  return { error: 'Could not find a unique slug after multiple attempts' };
}

// ────────────────────────────── social carousel ───────────────────────────────

function enc(v: string): string {
  return encodeURIComponent(v);
}
function slideUrl(params: Record<string, string | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${enc(String(v))}`)
    .join('&');
  return `${IMG_BASE}/api/social/image?${q}`;
}

async function publishStoryCarousel(
  supabase: ReturnType<typeof createAdminClient>,
  listing: Listing,
  post: { id: string; slug: string },
  content: { hero: string; quote: string; blurb: string },
  storyUrl: string
): Promise<{ platforms: string[]; error?: string }> {
  const platforms = configuredPlatforms();
  if (platforms.length === 0) return { platforms: [] };

  const kind = TYPE_LABEL[listing.type] ?? 'Member';
  const hero = content.hero;
  const blurb = truncate(content.blurb, 180);
  const quote = truncate(content.quote, 220);

  const slideUrls = [
    slideUrl({ type: 'story', slide: '0', img: hero, name: listing.name, kind, city: listing.city ?? '' }),
    slideUrl({ type: 'story', slide: '1', quote }),
    slideUrl({ type: 'story', slide: '2', blurb }),
    slideUrl({ type: 'story', slide: '3', name: listing.name, url: `yogafoundersnetwork.com/community/${post.slug}` }),
  ];

  const caption = await buildStoryCaption(listing, storyUrl, content.quote);

  const uploaded = await uploadAll(slideUrls);
  if (!uploaded.ok) {
    for (const p of platforms) {
      await supabase.from('social_posts').insert({
        kind: 'story', ref_id: listing.id, ref_slug: post.slug, platform: p,
        caption, image_urls: slideUrls, status: 'failed', error_message: `media upload: ${uploaded.error}`,
      });
    }
    return { platforms: [], error: `media upload: ${uploaded.error}` };
  }

  const multi = uploaded.urls.length > 1;
  const published: string[] = [];
  let lastError: string | undefined;
  for (const p of platforms) {
    // Single-image-only platforms (Threads) get just the hero slide of the carousel.
    const firstOnly = multi && SINGLE_IMAGE_ONLY.includes(p);
    const media = firstOnly ? [uploaded.urls[0]] : uploaded.urls;
    const cap = clampCaption(caption, p as Platform, storyUrl);
    const outcome = await publish(p, media, cap);
    if (outcome.ok) published.push(p);
    else lastError = outcome.error;
    await supabase.from('social_posts').insert({
      kind: 'story', ref_id: listing.id, ref_slug: post.slug, platform: p,
      external_id: outcome.ok ? outcome.id : null, caption: cap, image_urls: media,
      status: outcome.ok ? 'published' : 'failed', error_message: outcome.ok ? null : outcome.error,
    });
  }

  return { platforms: published, error: published.length === 0 ? lastError : undefined };
}

// ───────────────────────────────── entry points ───────────────────────────────
// Draft-then-publish flow: generateSpotlightDraft writes an UNPUBLISHED
// blog_posts row (admin previews it), publishSpotlight flips it live and fires
// the social carousel. regenerateSpotlightDraft discards an unpublished draft
// and generates a fresh one.

export type SpotlightResult = {
  ok: boolean;
  skipped?: string;
  postSlug?: string;
  storyUrl?: string;
  platforms?: string[];
  error?: string;
};

async function loadListing(
  supabase: ReturnType<typeof createAdminClient>,
  listingId: string
): Promise<{ listing: Listing } | { error: string }> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .maybeSingle();
  if (error) return { error: `Failed to load listing: ${error.message}` };
  if (!data) return { error: 'Listing not found' };
  return { listing: data as Listing };
}

/**
 * Photos that actually load as images. Guards against dead scraped URLs on
 * seeded listings (see the Susan Horning black-hero incident — the slide
 * renderer additionally proxies content negotiation itself).
 */
async function usablePhotos(listing: Listing): Promise<string[]> {
  const out: string[] = [];
  for (const url of storyPhotos(listing).slice(0, 6)) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'image/jpeg,image/png;q=0.9,*/*;q=0.1' },
        signal: AbortSignal.timeout(6000),
      });
      const ct = (res.headers.get('content-type') || '').split(';')[0].trim();
      if (res.ok && ct.startsWith('image/')) out.push(url);
      res.body?.cancel();
    } catch {
      // unreachable photo — skip it
    }
  }
  return out;
}

function fallbackQuote(listing: Listing): string {
  const order: FounderQuestionKey[] = ['hard_truth', 'origin', 'leap', 'feeling', 'advice'];
  for (const key of order) {
    const v = listing.founder_story?.[key];
    if (v && v.trim()) return v.trim();
  }
  return `Welcome ${listing.name} to the network.`;
}

/** Generate the Welcome + Member Spotlight post as an UNPUBLISHED draft. */
export async function generateSpotlightDraft(listingId: string): Promise<SpotlightResult> {
  const supabase = createAdminClient();
  const loaded = await loadListing(supabase, listingId);
  if ('error' in loaded) return { ok: false, error: loaded.error };
  const { listing } = loaded;

  if (listing.status !== 'approved') return { ok: true, skipped: 'listing is not approved' };
  const reason = ineligibleReason(listing);
  if (reason) return { ok: true, skipped: reason };

  const photos = await usablePhotos(listing);
  if (photos.length === 0) {
    return { ok: false, error: 'None of the listing photos could be loaded — add a working photo and regenerate' };
  }

  let generated: GeneratedStory;
  try {
    generated = await generateStoryPost(listing, photos);
  } catch (err) {
    console.error('[story] generation failed:', err);
    return { ok: false, error: `Story generation failed: ${err instanceof Error ? err.message : String(err)}` };
  }

  const contentWithImages = ensureImagesEmbedded(generated.content, photos, listing.name);
  const baseSlug = `welcome-${listing.slug}`;

  const insertResult = await insertPostWithUniqueSlug(supabase, baseSlug, {
    title: generated.title,
    excerpt: generated.excerpt,
    content: contentWithImages,
    author: 'Yoga Founders Network',
    author_avatar: null,
    cover_image: photos[0] ?? null,
    tags: [listing.type, listing.city].filter(Boolean),
    is_published: false,
    reading_time_minutes: estimateReadingMinutes(contentWithImages),
    category: 'founder_story',
    city: listing.city ?? null,
    meta_title: generated.meta_title,
    meta_description: generated.meta_description,
    published_at: null,
    pull_quote: generated.pull_quote,
    generated_by: 'claude-founder-story',
  });

  if ('error' in insertResult) {
    console.error('[story] insert error:', insertResult.error);
    return { ok: false, error: `Failed to save spotlight draft: ${insertResult.error}` };
  }

  const { error: linkErr } = await supabase
    .from('listings')
    .update({ story_post_id: insertResult.id })
    .eq('id', listing.id);
  if (linkErr) console.error('[story] failed to set story_post_id:', linkErr);

  return { ok: true, postSlug: insertResult.slug };
}

/** Publish a previously generated draft: flip it live + fire the carousel. */
export async function publishSpotlight(listingId: string): Promise<SpotlightResult> {
  const supabase = createAdminClient();
  const loaded = await loadListing(supabase, listingId);
  if ('error' in loaded) return { ok: false, error: loaded.error };
  const { listing } = loaded;

  if (!listing.story_post_id) {
    return { ok: false, error: 'No spotlight draft exists — generate one first' };
  }

  const { data: post, error: postErr } = await supabase
    .from('blog_posts')
    .select('id, slug, excerpt, is_published, pull_quote')
    .eq('id', listing.story_post_id)
    .maybeSingle();
  if (postErr || !post) return { ok: false, error: 'Spotlight draft could not be loaded' };

  const storyUrl = `${SITE.url}/community/${post.slug}`;

  if (post.is_published) {
    // Already live — only re-run the carousel if it never went out.
    const { data: prior } = await supabase
      .from('social_posts')
      .select('id')
      .eq('kind', 'story')
      .eq('ref_id', listing.id)
      .eq('status', 'published')
      .limit(1);
    if (prior && prior.length > 0) {
      return { ok: true, skipped: 'spotlight is already published and shared', postSlug: post.slug, storyUrl };
    }
  } else {
    const { error: flipErr } = await supabase
      .from('blog_posts')
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq('id', post.id);
    if (flipErr) return { ok: false, error: `Failed to publish the post: ${flipErr.message}` };
  }

  // Carousel is best-effort: a failure here must never unpublish the post.
  const photos = await usablePhotos(listing);
  let platforms: string[] = [];
  let publishError: string | undefined;
  try {
    const outcome = await publishStoryCarousel(
      supabase,
      listing,
      { id: post.id, slug: post.slug },
      {
        hero: photos[0] ?? '',
        quote: post.pull_quote || fallbackQuote(listing),
        blurb: listing.founder_story?.leap?.trim() || post.excerpt || '',
      },
      storyUrl
    );
    platforms = outcome.platforms;
    publishError = outcome.error;
  } catch (err) {
    console.error('[story] carousel publish failed:', err);
    publishError = err instanceof Error ? err.message : String(err);
  }

  return {
    ok: true,
    postSlug: post.slug,
    storyUrl,
    platforms,
    ...(publishError ? { error: publishError } : {}),
  };
}

/**
 * Re-share the carousel for an ALREADY published spotlight, bypassing the
 * "already shared" guard — for correcting a bad earlier share (e.g. the black
 * hero incident). Posts a fresh carousel; it does not remove prior posts.
 */
export async function reshareSpotlightCarousel(listingId: string): Promise<SpotlightResult> {
  const supabase = createAdminClient();
  const loaded = await loadListing(supabase, listingId);
  if ('error' in loaded) return { ok: false, error: loaded.error };
  const { listing } = loaded;

  if (!listing.story_post_id) return { ok: false, error: 'No spotlight exists for this listing' };
  const { data: post, error: postErr } = await supabase
    .from('blog_posts')
    .select('id, slug, excerpt, is_published, pull_quote')
    .eq('id', listing.story_post_id)
    .maybeSingle();
  if (postErr || !post) return { ok: false, error: 'Spotlight post could not be loaded' };
  if (!post.is_published) return { ok: false, error: 'Spotlight is not published — use the publish flow instead' };

  const storyUrl = `${SITE.url}/community/${post.slug}`;
  const photos = await usablePhotos(listing);
  const outcome = await publishStoryCarousel(
    supabase,
    listing,
    { id: post.id, slug: post.slug },
    {
      hero: photos[0] ?? '',
      quote: post.pull_quote || fallbackQuote(listing),
      blurb: listing.founder_story?.leap?.trim() || post.excerpt || '',
    },
    storyUrl
  );
  return { ok: true, postSlug: post.slug, storyUrl, platforms: outcome.platforms, ...(outcome.error ? { error: outcome.error } : {}) };
}

/** Discard an unpublished draft and generate a fresh one. */
export async function regenerateSpotlightDraft(listingId: string): Promise<SpotlightResult> {
  const supabase = createAdminClient();
  const loaded = await loadListing(supabase, listingId);
  if ('error' in loaded) return { ok: false, error: loaded.error };
  const { listing } = loaded;

  if (listing.story_post_id) {
    const { data: post } = await supabase
      .from('blog_posts')
      .select('id, is_published')
      .eq('id', listing.story_post_id)
      .maybeSingle();
    if (post?.is_published) {
      return { ok: false, error: 'Spotlight is already published — it can no longer be regenerated' };
    }
    const { error: clearErr } = await supabase
      .from('listings')
      .update({ story_post_id: null })
      .eq('id', listing.id);
    if (clearErr) return { ok: false, error: `Failed to detach old draft: ${clearErr.message}` };
    if (post) await supabase.from('blog_posts').delete().eq('id', post.id);
  }

  return generateSpotlightDraft(listingId);
}
