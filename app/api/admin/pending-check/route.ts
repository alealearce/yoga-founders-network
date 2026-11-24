import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { SITE, ADMIN } from '@/lib/config/site';
import { isStoryEligible } from '@/lib/social/eligibility';
import { autoSpotlight } from '@/lib/moderation/auto';
import { escapeHtml } from '@/lib/email/resend';
import type { Listing } from '@/lib/supabase/types';

export const maxDuration = 300;

type Db = ReturnType<typeof createAdminClient>;
const HOUR = 60 * 60 * 1000;

/**
 * Safety net for the automatic Member Spotlight (lib/moderation/auto.ts).
 * It normally runs right after a listing goes live; if that run died or the
 * model was down, an approved, qualifying listing is left with no post. Retry
 * those here: touched 1 hour to 3 days ago (older ones are left alone so a
 * listing that can never work is not retried forever), 3 a run at most.
 */
async function retrySpotlights(supabase: Db): Promise<string[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'approved')
    .is('story_post_id', null)
    .eq('story_opt_out', false)
    .not('founder_story', 'is', null)
    .gte('updated_at', new Date(Date.now() - 72 * HOUR).toISOString())
    .lte('updated_at', new Date(Date.now() - HOUR).toISOString())
    .limit(20);
  if (error) {
    console.error('[pending-check] spotlight retry query error:', error);
    return [];
  }
  const lines: string[] = [];
  for (const listing of ((data ?? []) as Listing[]).filter(isStoryEligible).slice(0, 3)) {
    try {
      const outcome = await autoSpotlight(listing.id, { notify: false });
      lines.push(`${listing.name}: ${outcome.status}${outcome.detail ? ` (${outcome.detail})` : ''}`);
    } catch (err) {
      console.error('[pending-check] spotlight retry error:', err);
      lines.push(`${listing.name}: failed (${err instanceof Error ? err.message : String(err)})`);
    }
  }
  return lines;
}

/** Spotlight drafts that failed the automatic check and have waited 48h+ for him. */
async function waitingDrafts(supabase: Db, cutoff: string): Promise<{ id: string; name: string }[]> {
  const { data: drafts } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('category', 'founder_story')
    .eq('is_published', false)
    .lte('created_at', cutoff);
  const ids = (drafts ?? []).map((d) => d.id);
  if (ids.length === 0) return [];
  const { data: listings } = await supabase.from('listings').select('id, name').in('story_post_id', ids);
  return listings ?? [];
}

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find listings that have been pending for more than 48 hours
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: pendingListings, error } = await supabase
    .from('listings')
    .select('id, name, type, created_at')
    .eq('status', 'pending')
    .lte('created_at', cutoff);

  if (error) {
    console.error('[pending-check] supabase error:', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  const count = pendingListings?.length ?? 0;
  const retried = await retrySpotlights(supabase);
  const drafts = await waitingDrafts(supabase, cutoff);

  if (count === 0 && retried.length === 0 && drafts.length === 0) {
    return NextResponse.json({ ok: true, pending: 0, drafts: 0, retried: 0, emailSent: false });
  }

  const subjectParts = [
    count > 0 ? `${count} listing${count > 1 ? 's' : ''} pending review for 48h+` : '',
    drafts.length > 0 ? `${drafts.length} spotlight draft${drafts.length > 1 ? 's' : ''} waiting` : '',
    retried.length > 0 ? `${retried.length} spotlight${retried.length > 1 ? 's' : ''} retried` : '',
  ].filter(Boolean);

  const draftSection = drafts.length
    ? `<p>Spotlight drafts that did not pass the automatic check and are still unpublished:</p>
       <ul>${drafts.map((d) => `<li><a href="${SITE.url}/admin/spotlight/${d.id}">${escapeHtml(d.name)}</a></li>`).join('')}</ul>`
    : '';
  const retrySection = retried.length
    ? `<p>Spotlights that had not been written and were tried again just now:</p>
       <ul>${retried.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`
    : '';
  const pendingSection = count === 0 ? '' : `
        <p>The following ${count} listing${count > 1 ? 's have' : ' has'} been waiting for review for more than 48 hours:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e0;border-radius:4px;overflow:hidden;margin:16px 0;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:13px;">Name</th>
              <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:13px;">Type</th>
              <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:13px;">Submitted</th>
            </tr>
          </thead>
          <tbody>${(pendingListings ?? [])
            .map(
              (l) =>
                `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e8e8e0;">${escapeHtml(l.name)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8e8e0;text-transform:capitalize;">${l.type}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e8e8e0;font-size:13px;color:#888;">${new Date(l.created_at).toLocaleDateString()}</td>
        </tr>`
            )
            .join('')}</tbody>
        </table>`;

  // Send admin reminder email
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: SITE.fromEmail,
    to:   [...ADMIN.emails],
    subject: `${subjectParts.join(', ')} — Yoga Founders Network`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#111111;">Waiting For You</h2>
        ${pendingSection}
        ${draftSection}
        ${retrySection}
        <a href="${SITE.url}/admin"
           style="display:inline-block;background:#111111;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">
          Review in Admin →
        </a>
        <p style="margin-top:24px;font-size:12px;color:#888;font-family:Arial,sans-serif;">Yoga Founders Network — Automated cron notification</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true, pending: count, drafts: drafts.length, retried: retried.length, emailSent: true });
}
