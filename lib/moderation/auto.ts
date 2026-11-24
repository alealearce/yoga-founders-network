/**
 * Auto-approve: the two decisions Alejandro used to make by hand.
 *
 *   decideListing()  — a new form submission goes live unless the screen holds it.
 *   autoSpotlight()  — an eligible Member Spotlight is written, checked and
 *                      published; a draft that fails the check waits for him.
 *
 * Every outcome emails him: "Live, no action needed" or "Needs your review"
 * with the reasons. Server-only (database, Claude, email).
 */

import { createAdminClient } from '@/lib/supabase/server';
import { SITE } from '@/lib/config/site';
import { getListingUrl } from '@/lib/utils/listingUrl';
import { generateSpotlightDraft, publishSpotlight } from '@/lib/social/story';
import { sendAdminAutoEmail, sendSpotlightLiveEmail, escapeHtml } from '@/lib/email/resend';
import {
  screenListing, checkSpotlightDraft, websiteHost, isSharedHost,
  type ScreenInput, type ScreenContext,
} from '@/lib/moderation/screen';
import { judgeListing } from '@/lib/moderation/judge';

type Db = ReturnType<typeof createAdminClient>;

async function loadContext(supabase: Db, listingId: string, input: ScreenInput): Promise<ScreenContext> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const host = websiteHost(input.website);
  const useHost = host && !isSharedHost(host) ? host : null;

  const [recent, byEmail, byHost] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }).is('owner_id', null).gte('created_at', since),
    supabase.from('listings').select('id, name, type, status, website, email').ilike('email', input.email).neq('id', listingId).limit(20),
    useHost
      ? supabase.from('listings').select('id, name, type, status, website, email').ilike('website', `%${useHost}%`).neq('id', listingId).limit(20)
      : Promise.resolve({ data: [] as { id: string; name: string; type: string; status: string; website: string | null; email: string | null }[] }),
  ]);

  const seen = new Map<string, ScreenContext['related'][number]>();
  for (const row of [...(byEmail.data ?? []), ...(byHost.data ?? [])]) {
    // ilike is a loose match ("_" is a wildcard); keep only exact ones.
    const sameHost = !!useHost && websiteHost(row.website) === useHost;
    const sameEmail = !!row.email && row.email.toLowerCase() === input.email.toLowerCase();
    if (sameHost || sameEmail) {
      seen.set(row.id, { name: row.name, type: row.type, status: row.status, sameHost, sameEmail });
    }
  }
  return { submissionsLast24h: recent.count ?? 1, related: Array.from(seen.values()) };
}

/** Screen a just-inserted pending listing. Returns the reasons to hold it; empty = approve. */
export async function decideListing(
  listingId: string,
  input: ScreenInput & { city?: string; country?: string }
): Promise<string[]> {
  try {
    const supabase = createAdminClient();
    const reasons = screenListing(input, await loadContext(supabase, listingId, input));
    if (reasons.length) return reasons;
    const judged = await judgeListing(input);
    return judged.hold ? [judged.reason] : [];
  } catch (err) {
    console.error('[moderation] decideListing failed:', err);
    return ['The automatic check could not run, so this one waits for you.'];
  }
}

export type AutoSpotlightOutcome = {
  status: 'published' | 'held' | 'skipped' | 'failed';
  postSlug?: string;
  storyUrl?: string;
  detail?: string;
};

/**
 * Write, check and publish the Member Spotlight for an approved listing.
 * Safe to call again: a listing that already has a post is skipped.
 * `notify: false` is for the daily sweep, which reports outcomes in one email.
 */
export async function autoSpotlight(listingId: string, opts: { notify?: boolean } = {}): Promise<AutoSpotlightOutcome> {
  const notify = opts.notify ?? true;
  const supabase = createAdminClient();
  const previewUrl = `${SITE.url}/admin/spotlight/${listingId}`;

  const drafted = await generateSpotlightDraft(listingId);
  const { data: listing } = await supabase
    .from('listings')
    .select('name, email, description, tagline, founder_story, story_post_id')
    .eq('id', listingId)
    .maybeSingle();
  const name = listing?.name ?? 'a listing';

  if (drafted.skipped) return { status: 'skipped', detail: drafted.skipped };
  if (!drafted.ok || !drafted.postSlug || !listing?.story_post_id) {
    const detail = drafted.error ?? 'The draft could not be written.';
    if (notify) {
      await sendAdminAutoEmail({
        needsReview: true,
        subject: `Needs your review: spotlight for ${name} could not be written`,
        heading: 'Spotlight Not Written',
        intro: `The Member Spotlight for <strong>${escapeHtml(name)}</strong> could not be written. It will be tried again at the next daily check.`,
        reasons: [detail],
        ctaUrl: `${SITE.url}/admin?tab=stories`,
        ctaLabel: 'Open Stories',
      }).catch((err) => console.error('[moderation] admin email error:', err));
    }
    return { status: 'failed', detail };
  }

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, content, pull_quote')
    .eq('id', listing.story_post_id)
    .maybeSingle();
  const reasons = post
    ? checkSpotlightDraft(post, listing)
    : ['The draft could not be read back for checking.'];

  if (reasons.length) {
    if (notify) {
      await sendAdminAutoEmail({
        needsReview: true,
        subject: `Needs your review: spotlight draft for ${name}`,
        heading: 'Spotlight Draft Waiting',
        intro: `The Member Spotlight for <strong>${escapeHtml(name)}</strong> is written but was not published. Read it, then publish or regenerate.`,
        reasons,
        ctaUrl: previewUrl,
        ctaLabel: 'Preview the Draft',
      }).catch((err) => console.error('[moderation] admin email error:', err));
    }
    return { status: 'held', postSlug: drafted.postSlug, detail: reasons.join(' ') };
  }

  const published = await publishSpotlight(listingId);
  if (!published.ok || !published.storyUrl) {
    const detail = published.error ?? 'Publishing failed.';
    if (notify) {
      await sendAdminAutoEmail({
        needsReview: true,
        subject: `Needs your review: spotlight for ${name} did not publish`,
        heading: 'Spotlight Not Published',
        intro: `The Member Spotlight for <strong>${escapeHtml(name)}</strong> passed its check but did not publish.`,
        reasons: [detail],
        ctaUrl: previewUrl,
        ctaLabel: 'Preview the Draft',
      }).catch((err) => console.error('[moderation] admin email error:', err));
    }
    return { status: 'held', postSlug: drafted.postSlug, detail };
  }

  if (listing.email) {
    await sendSpotlightLiveEmail(listing.email, listing.name, published.storyUrl).catch((err) =>
      console.error('[moderation] spotlight email error:', err)
    );
  }
  if (notify) {
    const shared = published.platforms?.length ? `Shared to ${published.platforms.join(', ')}.` : 'It was not shared to social.';
    await sendAdminAutoEmail({
      needsReview: false,
      subject: `Live, no action needed: spotlight for ${name}`,
      heading: 'Spotlight Published',
      intro: `The Member Spotlight for <strong>${escapeHtml(name)}</strong> passed its check and is live. ${shared}`,
      reasons: published.error ? [`Social sharing problem: ${published.error}`] : [],
      ctaUrl: published.storyUrl,
      ctaLabel: 'Read the Spotlight',
    }).catch((err) => console.error('[moderation] admin email error:', err));
  }
  return { status: 'published', postSlug: published.postSlug, storyUrl: published.storyUrl, detail: published.error };
}

export function listingPublicUrl(type: string, slug: string): string {
  return `${SITE.url}${getListingUrl(type, slug)}`;
}
