import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { SITE } from '@/lib/config/site';
import { getListingUrl } from '@/lib/utils/listingUrl';
import { buildBlogContent, buildShowcaseCaption, showcaseBlurb, igHandle } from '@/lib/social/caption';
import { configuredPlatforms, isConfigured, uploadAll, publish, type Platform } from '@/lib/social/blotato';
import { sendFeaturedEmail } from '@/lib/email/resend';
import type { Listing } from '@/lib/supabase/types';

/**
 * Daily cron: publish two carousels to social via Blotato —
 *   • blog digest    — today's auto-generated Journal post (title + 3-pt TL;DR + link)
 *   • listing showcase — a rotating member of the directory
 *
 * Auth: Authorization: Bearer ${CRON_SECRET} (Vercel Cron sets this).
 * Query params (manual runs / testing):
 *   ?kind=blog|showcase|both   (default both)
 *   ?dry=1                      build slides + captions, do NOT upload or post
 *   ?slug=<blog-slug>           target a specific blog post
 *   ?id=<listing-id>            target a specific listing for the showcase
 *   ?force=1                    ignore the once-per-day showcase guard
 */

export const maxDuration = 300;

const IMG_BASE = process.env.SOCIAL_PUBLIC_BASE_URL || SITE.url;

// Weekday → preferred showcase type (falls through when that category is thin).
// getUTCDay: 0 Sun … 6 Sat.  Sunday = no preference (community roundup).
const WEEKDAY_TYPE: Record<number, Listing['type'] | undefined> = {
  1: 'studio', 2: 'teacher', 3: 'school', 4: 'retreat', 5: 'product', 6: 'workshop', 0: undefined,
};
const TYPE_LABEL: Record<string, string> = {
  studio: 'Studio', teacher: 'Teacher', school: 'School', retreat: 'Retreat', product: 'Product', workshop: 'Workshop',
};

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

type PlatformOutcome = { status: string; id?: string; error?: string };

async function publishCarousel(
  supabase: ReturnType<typeof createAdminClient>,
  opts: { kind: 'blog' | 'showcase'; refId: string; refSlug: string; slideUrls: string[]; caption: string; skip: Set<Platform> }
): Promise<Record<string, PlatformOutcome>> {
  const results: Record<string, PlatformOutcome> = {};
  const platforms = configuredPlatforms().filter((p) => !opts.skip.has(p));
  for (const p of configuredPlatforms()) if (opts.skip.has(p)) results[p] = { status: 'already_published' };
  if (platforms.length === 0) return results;

  // Upload the slides once, then reuse the hosted URLs for every platform.
  const uploaded = await uploadAll(opts.slideUrls);
  if (!uploaded.ok) {
    for (const p of platforms) {
      results[p] = { status: 'failed', error: `media upload: ${uploaded.error}` };
      await supabase.from('social_posts').insert({
        kind: opts.kind, ref_id: opts.refId, ref_slug: opts.refSlug, platform: p,
        caption: opts.caption, image_urls: opts.slideUrls, status: 'failed', error_message: `media upload: ${uploaded.error}`,
      });
    }
    return results;
  }

  for (const p of platforms) {
    const outcome = await publish(p, uploaded.urls, opts.caption);
    results[p] = outcome.ok ? { status: 'published', id: outcome.id } : { status: 'failed', error: outcome.error };
    await supabase.from('social_posts').insert({
      kind: opts.kind, ref_id: opts.refId, ref_slug: opts.refSlug, platform: p,
      external_id: outcome.ok ? outcome.id : null, caption: opts.caption, image_urls: uploaded.urls,
      status: outcome.ok ? 'published' : 'failed', error_message: outcome.ok ? null : outcome.error,
    });
  }
  return results;
}

// ───────────────────────────── blog digest ──────────────────────────────────

async function runBlog(supabase: ReturnType<typeof createAdminClient>, slug: string | null, dry: boolean) {
  const q = supabase.from('blog_posts').select('id, slug, title, excerpt, content, category').eq('is_published', true);
  const { data: post } = slug
    ? await q.eq('slug', slug).maybeSingle()
    : await q.order('published_at', { ascending: false }).limit(1).maybeSingle();
  if (!post) return { ok: false, reason: 'no published blog post' };

  const url = `${SITE.url}/community/${post.slug}`;
  const { points, caption } = await buildBlogContent(post, url);

  const slideUrls = [
    slideUrl({ type: 'blog', slide: '0', title: post.title, category: (post.category ?? 'the journal').replace(/_/g, ' ') }),
    slideUrl({ type: 'blog', slide: '1', points: points.join('|') }),
    slideUrl({ type: 'blog', slide: '2', title: post.title, url: `yogafoundersnetwork.com/community` }),
  ];

  // Idempotency: skip platforms already published for this post.
  const { data: done } = await supabase.from('social_posts').select('platform').eq('kind', 'blog').eq('ref_id', post.id).eq('status', 'published');
  const skip = new Set<Platform>((done ?? []).map((r) => r.platform as Platform));

  if (dry) return { ok: true, dry: true, post: { slug: post.slug, title: post.title }, url, points, caption, slideUrls, alreadyDone: Array.from(skip) };

  const results = await publishCarousel(supabase, { kind: 'blog', refId: post.id, refSlug: post.slug, slideUrls, caption, skip });
  return { ok: Object.values(results).some((r) => r.status === 'published'), post: { slug: post.slug, title: post.title }, url, results };
}

// ──────────────────────────── listing showcase ──────────────────────────────

async function pickListing(supabase: ReturnType<typeof createAdminClient>, id: string | null): Promise<Listing | null> {
  if (id) {
    const { data } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
    return (data as Listing) ?? null;
  }
  // Pull lightweight candidate rows for ALL approved listings, ordered
  // least-recently-featured first, then filter for ones that have a usable
  // image. (Filtering must happen across every candidate, not a pre-limited
  // window, or image-less imported rows would crowd out the eligible ones.)
  const { data } = await supabase
    .from('listings')
    .select('id, type, images, logo_url, owner_id, last_featured_at, created_at')
    .eq('status', 'approved')
    .order('last_featured_at', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true });
  type Lite = Pick<Listing, 'id' | 'type' | 'images' | 'logo_url' | 'owner_id' | 'last_featured_at'>;
  const eligible = ((data as Lite[]) ?? []).filter((l) => (l.images && l.images.length > 0) || l.logo_url);
  if (eligible.length === 0) return null;

  const preferred = WEEKDAY_TYPE[new Date().getUTCDay()];
  const firstOf = (pool: Lite[]) => (preferred && pool.find((l) => l.type === preferred)) || pool[0];

  // Prioritize claimed members (owner_id set) that haven't been featured in the
  // last 7 days — so a lone member doesn't repeat daily — else fall through to
  // any eligible (seeded) listing. As members claim, they take over the rotation.
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const claimedFresh = eligible.filter((l) => l.owner_id && (!l.last_featured_at || new Date(l.last_featured_at).getTime() < weekAgo));
  const chosen = claimedFresh.length ? firstOf(claimedFresh) : firstOf(eligible);

  const { data: full } = await supabase.from('listings').select('*').eq('id', chosen.id).maybeSingle();
  return (full as Listing) ?? null;
}

async function runShowcase(supabase: ReturnType<typeof createAdminClient>, id: string | null, dry: boolean, force: boolean) {
  // Once-per-day guard (unless a specific id or force is given).
  if (!id && !force && !dry) {
    const since = new Date(Date.now() - 18 * 3600 * 1000).toISOString();
    const { count } = await supabase
      .from('social_posts')
      .select('id', { count: 'exact', head: true })
      .eq('kind', 'showcase')
      .eq('status', 'published')
      .gte('created_at', since);
    if ((count ?? 0) > 0) return { ok: true, skipped: 'a showcase already went out in the last 18h' };
  }

  const listing = await pickListing(supabase, id);
  if (!listing) return { ok: false, reason: 'no eligible listing to feature' };

  const url = `${SITE.url}${getListingUrl(listing.type, listing.slug)}`;
  const label = TYPE_LABEL[listing.type] ?? 'Member';
  const hero = listing.images?.[0] || listing.logo_url || '';
  // Only opted-in members (claimed) get the @-tag + email; seeded listings don't.
  const isMember = Boolean(listing.owner_id);
  const handle = isMember && listing.social_instagram ? igHandle(listing.social_instagram) : '';
  const caption = await buildShowcaseCaption(listing, url, { isMember });

  const slideUrls = [
    slideUrl({ type: 'showcase', slide: '0', kind: label, name: listing.name, city: listing.city ?? '', country: listing.country ?? '', img: hero }),
    slideUrl({ type: 'showcase', slide: '1', name: listing.name, blurb: showcaseBlurb(listing) }),
    slideUrl({ type: 'showcase', slide: '2', name: listing.name, style: listing.yoga_styles?.[0] ?? '', city: listing.city ?? '', country: listing.country ?? '' }),
    slideUrl({ type: 'showcase', slide: '3', name: listing.name, handle }),
  ];

  if (dry) return { ok: true, dry: true, listing: { id: listing.id, name: listing.name, type: listing.type }, url, caption, slideUrls };

  const results = await publishCarousel(supabase, { kind: 'showcase', refId: listing.id, refSlug: listing.slug, slideUrls, caption, skip: new Set() });
  const published = Object.values(results).some((r) => r.status === 'published');

  if (published) {
    await supabase.from('listings').update({ last_featured_at: new Date().toISOString() }).eq('id', listing.id);
    // Only email opted-in members — never the seeded listings.
    if (isMember && listing.email) {
      try {
        await sendFeaturedEmail(listing.email, listing.name, url);
      } catch (e) {
        console.error('[daily-social] featured email failed:', e);
      }
    }
  }
  return { ok: published, listing: { id: listing.id, name: listing.name, type: listing.type }, url, results };
}

// ───────────────────────────── handler ──────────────────────────────────────

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const p = req.nextUrl.searchParams;
  const kind = (p.get('kind') || 'both') as 'blog' | 'showcase' | 'both';
  const dry = p.get('dry') === '1';
  const force = p.get('force') === '1';
  const slug = p.get('slug');
  const id = p.get('id');

  if (!dry && !isConfigured()) {
    return NextResponse.json(
      { error: 'Blotato not configured', hint: 'Set BLOTATO_API_KEY + at least one *_ACCOUNT_ID. Use ?dry=1 to preview without posting.' },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();
  const out: Record<string, unknown> = { dryRun: dry, platforms: configuredPlatforms() };

  if (kind === 'blog' || kind === 'both') out.blog = await runBlog(supabase, slug, dry);
  if (kind === 'showcase' || kind === 'both') out.showcase = await runShowcase(supabase, id, dry, force);

  return NextResponse.json(out);
}
