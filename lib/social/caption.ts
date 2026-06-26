/**
 * caption.ts — Captions + slide copy for the two daily YFN post types.
 *
 * Voice: Lotus — calm, grounded, encouraging, inclusive; understands the
 * business side of yoga without being salesy.
 *
 * Both builders use Claude Haiku (cheap) and fall back to a deterministic
 * template if ANTHROPIC_API_KEY is absent or the call fails — the post still
 * goes out. Every caption ends with the canonical URL (a clickable link on
 * Facebook / LinkedIn) and a small, capped hashtag set.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Listing, BlogPost } from '@/lib/supabase/types';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_HASHTAGS = 5; // Blotato/IG reject overly-tagged posts; keep it tight.

const BASE_TAGS = ['#yoga', '#yogateacher', '#yogastudio', '#yogacommunity', '#yogaeveryday'];
const CATEGORY_TAGS: Record<string, string[]> = {
  finding_yoga: ['#yogaforbeginners', '#findyourpractice'],
  studio_guides: ['#yogastudio', '#yogaclass'],
  teacher_guides: ['#yogateachertraining', '#ytt'],
  wellness: ['#yogawellness', '#mindbody'],
  yoga_lifestyle: ['#yogalifestyle', '#yogi'],
};
const TYPE_TAGS: Record<string, string[]> = {
  studio: ['#yogastudio'],
  teacher: ['#yogateacher'],
  school: ['#yogaschool', '#yogateachertraining'],
  retreat: ['#yogaretreat'],
  product: ['#yogaproducts', '#yogagear'],
  workshop: ['#yogaworkshop'],
};

function tags(...groups: string[][]): string {
  const seen = new Set<string>();
  for (const g of groups) for (const t of g) if (t) seen.add(t.toLowerCase());
  return Array.from(seen).slice(0, MAX_HASHTAGS).join(' ');
}

function client(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function ask(system: string, user: string): Promise<string | null> {
  const a = client();
  if (!a) return null;
  try {
    const m = await a.messages.create({ model: MODEL, max_tokens: 500, system, messages: [{ role: 'user', content: user }] });
    const block = m.content[0];
    return block.type === 'text' && block.text.trim() ? block.text.trim() : null;
  } catch {
    return null;
  }
}

// ───────────────────────────── blog digest ──────────────────────────────────

export type BlogContent = { points: string[]; caption: string };

const BLOG_SYS = `You write for Yoga Founders Network's Instagram — the global directory for yoga studios, teachers, schools, retreats & products.
Voice: calm, grounded, encouraging, inclusive. Knowledgeable but never preachy or salesy.
Return ONLY minified JSON: {"points":["...","...","..."],"hook":"..."}.
- points: EXACTLY 3 takeaways from the post, each a punchy standalone line, max ~90 characters, no numbering, no trailing period required.
- hook: 1–2 short scroll-stopping caption lines. No hashtags, no links, no emojis-as-filler (one tasteful emoji ok).`;

function fallbackPoints(post: Pick<BlogPost, 'excerpt' | 'content'>): string[] {
  const source = (post.excerpt || post.content || '').replace(/[#*_>`]/g, ' ');
  const sentences = source.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 20);
  const picked = sentences.slice(0, 3).map((s) => (s.length > 95 ? s.slice(0, 92).trim() + '…' : s));
  while (picked.length < 3) picked.push('Read the full guide on The Journal.');
  return picked;
}

export async function buildBlogContent(post: Pick<BlogPost, 'title' | 'slug' | 'excerpt' | 'content' | 'category'>, url: string): Promise<BlogContent> {
  const hashtags = tags(CATEGORY_TAGS[post.category ?? ''] ?? [], BASE_TAGS);
  let points = fallbackPoints(post);
  let hook = post.excerpt?.trim() || post.title;

  const raw = await ask(
    BLOG_SYS,
    `Title: ${post.title}\nCategory: ${post.category ?? 'general'}\nSummary: ${post.excerpt ?? '(none)'}\nExcerpt of body: ${(post.content || '').slice(0, 1200)}`
  );
  if (raw) {
    try {
      const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')) as { points?: string[]; hook?: string };
      if (Array.isArray(parsed.points) && parsed.points.length >= 3) points = parsed.points.slice(0, 3).map((p) => String(p).trim());
      if (parsed.hook && parsed.hook.trim()) hook = parsed.hook.trim();
    } catch {
      /* keep fallbacks */
    }
  }

  const caption = [
    `📌 ${post.title}`,
    '',
    hook,
    '',
    `🔗 Read the full piece on The Journal → ${url}`,
    '',
    hashtags,
  ].join('\n');

  return { points, caption };
}

// ──────────────────────────── listing showcase ──────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  studio: 'Studio', teacher: 'Teacher', school: 'School', retreat: 'Retreat Center', product: 'Product', workshop: 'Workshop',
};

const SHOW_SYS = `You write warm, genuine Instagram captions for Yoga Founders Network spotlighting a member of our global yoga directory.
Voice: calm, grounded, encouraging, celebratory but not gushing. Inclusive of all levels.
Write 2–4 short lines that make a reader want to discover this listing. No hashtags, no links, no @handles — those are appended separately. One tasteful emoji max. Output ONLY the caption text.`;

/** A short, safe blurb for the showcase "why" slide and as caption fallback. */
export function showcaseBlurb(listing: Pick<Listing, 'description' | 'long_description' | 'tagline'>): string {
  const text = (listing.tagline || listing.description || listing.long_description || '').trim();
  if (!text) return 'A valued member of the global Yoga Founders Network community.';
  return text.length > 280 ? text.slice(0, 277).trim() + '…' : text;
}

/** Tidy a stored website value into a clean, clickable URL. */
function cleanWebsite(raw: string): string {
  const t = raw.trim().replace(/\/+$/, '');
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export async function buildShowcaseCaption(
  listing: Pick<Listing, 'name' | 'type' | 'city' | 'country' | 'description' | 'long_description' | 'tagline' | 'social_instagram' | 'website'>,
  url: string,
  opts: { isMember: boolean } = { isMember: false }
): Promise<string> {
  const label = TYPE_LABEL[listing.type] ?? 'Member';
  const loc = [listing.city, listing.country].filter(Boolean).join(', ');
  const hashtags = tags(TYPE_TAGS[listing.type] ?? [], BASE_TAGS);

  const body =
    (await ask(
      SHOW_SYS,
      `Featured ${label}: ${listing.name}\nLocation: ${loc || 'worldwide'}\nAbout: ${showcaseBlurb(listing)}`
    )) || `Meet ${listing.name} — ${showcaseBlurb(listing)}`;

  // Tag the business's Instagram (@handle tags on IG; reads as text elsewhere)
  // and link their website. Members get a collaboration credit; seeded listings
  // get a softer "follow along" plus the "claim your listing" signup hook.
  const handle = listing.social_instagram ? igHandle(listing.social_instagram) : '';
  const website = listing.website ? cleanWebsite(listing.website) : '';
  return [
    `✨ Featured ${label}: ${listing.name}`,
    loc ? `📍 ${loc}` : '',
    '',
    body,
    '',
    `🔗 Discover ${listing.name} on Yoga Founders Network → ${url}`,
    website ? `🌐 ${website}` : '',
    handle ? (opts.isMember ? `🤝 In collaboration with ${handle}` : `📸 Follow along → ${handle}`) : '',
    !opts.isMember ? `📣 Is this your space? Claim your free listing → yogafoundersnetwork.com` : '',
    '',
    hashtags,
  ]
    .filter((l) => l !== '')
    .join('\n');
}

/** Normalize a stored Instagram value (handle or URL) to an @handle. */
export function igHandle(raw: string): string {
  const m = raw.trim().match(/(?:instagram\.com\/)?@?([A-Za-z0-9._]+)\/?$/);
  return m ? `@${m[1]}` : '';
}
