import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { SITE } from '@/lib/config/site';
import { getListingUrl } from '@/lib/utils/listingUrl';
import { sendSpotlightInviteEmail } from '@/lib/email/resend';
import type { Listing } from '@/lib/supabase/types';

/**
 * Get Featured outreach engine — Phase 1, BUILT DISARMED.
 *
 * This route is intentionally NOT wired into vercel.json crons. It is a
 * manually-triggered admin API, dry-run by default. Do not add a cron entry
 * for this without explicit sign-off.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET} (same pattern as daily-social).
 * Query params:
 *   ?limit=25    max candidates to process (default 25, hard cap 50)
 *   ?live=1      actually send emails + write outreach_log (default: dry preview, sends NOTHING)
 *   ?kind=spotlight_invite_1   outreach_log kind (default spotlight_invite_1)
 *   ?example=<url>   optional manual override for the "recent spotlight" example link
 */

export const maxDuration = 300;

const VALID_KINDS = ['spotlight_invite_1', 'spotlight_invite_2', 'spotlight_invite_3'] as const;
type OutreachKind = (typeof VALID_KINDS)[number];

// Candidate pool is small (a few hundred unclaimed listings at most) — fetch
// generously so exclusion filtering never starves the requested limit.
const CANDIDATE_POOL_SIZE = 500;

type Candidate = Pick<Listing, 'id' | 'name' | 'email' | 'type' | 'slug' | 'invite_token'>;

/**
 * Most recent published Member Spotlight, if one exists. Never fabricate a
 * placeholder — the email must omit the example paragraph entirely until a
 * real spotlight is live, then pick it up automatically.
 */
async function resolveExampleUrl(
  supabase: ReturnType<typeof createAdminClient>,
  override: string | undefined
): Promise<string | null> {
  if (override) return override;
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('category', 'founder_story')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? `${SITE.url}/community/${data.slug}` : null;
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const p = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(parseInt(p.get('limit') ?? '25', 10) || 25, 1), 50);
  const live = p.get('live') === '1';
  const kindParam = p.get('kind') ?? 'spotlight_invite_1';
  const kind = (VALID_KINDS.includes(kindParam as OutreachKind) ? kindParam : 'spotlight_invite_1') as OutreachKind;
  const exampleOverride = p.get('example') || undefined;

  const supabase = createAdminClient();
  const exampleUrl = await resolveExampleUrl(supabase, exampleOverride);

  // Listings already invited at this kind — excluded from the candidate pool.
  const { data: logged } = await supabase
    .from('outreach_log')
    .select('listing_id')
    .eq('kind', kind);
  const excluded = new Set((logged ?? []).map((r) => r.listing_id as string));

  const { data: pool, error: poolError } = await supabase
    .from('listings')
    .select('id, name, email, type, slug, invite_token, created_at')
    .eq('status', 'approved')
    .is('owner_id', null)
    .not('email', 'is', null)
    .eq('outreach_opt_out', false)
    .is('story_post_id', null)
    .is('founder_story', null)
    .order('created_at', { ascending: true })
    .limit(CANDIDATE_POOL_SIZE);

  if (poolError) {
    console.error('[spotlight-invites] pool query error:', poolError);
    return NextResponse.json({ error: 'DB error fetching candidates' }, { status: 500 });
  }

  const candidates = ((pool as Candidate[]) ?? [])
    .filter((l) => l.email && l.email.trim() !== '' && !excluded.has(l.id))
    .slice(0, limit);

  if (!live) {
    return NextResponse.json({
      dry: true,
      kind,
      exampleUrl,
      wouldSend: candidates.map((c) => ({ id: c.id, name: c.name, email: c.email })),
      count: candidates.length,
    });
  }

  let sent = 0;
  let failed = 0;
  const results: { id: string; name: string; email: string; status: 'sent' | 'failed'; error?: string }[] = [];

  for (const listing of candidates) {
    const inviteUrl = `${SITE.url}/get-featured?token=${listing.invite_token}`;
    const listingUrl = `${SITE.url}${getListingUrl(listing.type, listing.slug)}`;
    const unsubscribeUrl = `${SITE.url}/api/outreach/unsubscribe?token=${listing.invite_token}`;

    try {
      await sendSpotlightInviteEmail(
        listing.email!,
        listing.name,
        inviteUrl,
        listingUrl,
        unsubscribeUrl,
        exampleUrl ?? undefined
      );
      await supabase.from('outreach_log').insert({
        listing_id: listing.id,
        kind,
        email: listing.email!,
        status: 'sent',
      });
      sent += 1;
      results.push({ id: listing.id, name: listing.name, email: listing.email!, status: 'sent' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[spotlight-invites] send failed for ${listing.id}:`, err);
      await supabase.from('outreach_log').insert({
        listing_id: listing.id,
        kind,
        email: listing.email!,
        status: 'failed',
        error_message: errorMessage,
      });
      failed += 1;
      results.push({ id: listing.id, name: listing.name, email: listing.email!, status: 'failed', error: errorMessage });
    }
  }

  return NextResponse.json({ sent, failed, exampleUrl, results });
}
