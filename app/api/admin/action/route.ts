import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendApprovalEmail, sendRejectionEmail, sendSpotlightLiveEmail } from '@/lib/email/resend';
import { SITE, isAdminEmail } from '@/lib/config/site';
import { getListingUrl } from '@/lib/utils/listingUrl';
import { generateSpotlightDraft, publishSpotlight, regenerateSpotlightDraft, type SpotlightResult } from '@/lib/social/story';

export const maxDuration = 300;

const VALID_ACTIONS = ['approve', 'reject', 'feature', 'verify', 'delete', 'story', 'story_publish', 'story_regenerate'] as const;
type AdminAction = typeof VALID_ACTIONS[number];

type StoryStatus = 'draft' | 'published' | 'skipped' | 'failed' | 'none';

function statusFromDraft(result: SpotlightResult): StoryStatus {
  if (result.ok && result.postSlug) return 'draft';
  if (result.ok && result.skipped) return 'skipped';
  return 'failed';
}

export async function POST(req: NextRequest) {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, id, reason } = await req.json() as {
      action: string;
      id: string;
      reason?: string;
    };

    if (!VALID_ACTIONS.includes(action as AdminAction) || !id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Populated by the 'approve' and 'story*' cases; surfaced on the response
    // so AdminClient.tsx can show spotlight status without a second round trip.
    let storyStatus: StoryStatus = 'none';
    let storyUrl: string | undefined;
    let storySlug: string | undefined;

    switch (action as AdminAction) {
      case 'approve': {
        const { data: listing, error: updateError } = await supabase
          .from('listings')
          .update({ status: 'approved' })
          .eq('id', id)
          .select('name, slug, email, type')
          .single();

        if (updateError) {
          console.error('[admin/approve] update error:', updateError);
          return NextResponse.json(
            { error: `Approval failed: ${updateError.message}` },
            { status: 500 }
          );
        }

        // Founder Spotlight: generates an UNPUBLISHED draft when the listing
        // qualifies — the admin previews and publishes it from the Stories
        // tab. Never let a spotlight failure fail the approval.
        try {
          const result = await generateSpotlightDraft(id);
          storyStatus = statusFromDraft(result);
          storySlug = result.postSlug;
        } catch (err) {
          console.error('[admin/approve] spotlight draft error:', err);
          storyStatus = 'failed';
        }

        // Send approval email to listing owner. Awaited — un-awaited promises
        // die when Vercel freezes the function after the response is sent.
        // The spotlight link is NOT included here — the member gets the
        // spotlight-live email when the admin publishes the draft.
        if (listing?.email && listing?.name && listing?.slug) {
          const listingUrl = `${SITE.url}${getListingUrl(listing.type, listing.slug)}`;
          await sendApprovalEmail(listing.email, listing.name, listing.name, listingUrl).catch((err) =>
            console.error('[admin/approve] approval email error:', err)
          );
        }
        break;
      }

      case 'story': {
        // Generate (or retry) the spotlight DRAFT for an approved listing.
        // Idempotent — guards on story_post_id inside generateSpotlightDraft.
        try {
          const result = await generateSpotlightDraft(id);
          storyStatus = statusFromDraft(result);
          storySlug = result.postSlug;
          if (storyStatus === 'failed') console.error('[admin/story] draft failed:', result.error);
        } catch (err) {
          console.error('[admin/story] spotlight draft error:', err);
          storyStatus = 'failed';
        }
        break;
      }

      case 'story_regenerate': {
        // Discard an unpublished draft and generate a fresh one.
        try {
          const result = await regenerateSpotlightDraft(id);
          storyStatus = statusFromDraft(result);
          storySlug = result.postSlug;
          if (storyStatus === 'failed') console.error('[admin/story_regenerate] failed:', result.error);
        } catch (err) {
          console.error('[admin/story_regenerate] error:', err);
          storyStatus = 'failed';
        }
        break;
      }

      case 'story_publish': {
        // Flip the previewed draft live + fire the social carousel + tell the
        // member. This is the explicit "share it" moment.
        try {
          const result = await publishSpotlight(id);
          if (result.ok && result.storyUrl && !result.skipped) {
            storyStatus = 'published';
            storyUrl = result.storyUrl;
            storySlug = result.postSlug;

            const { data: listing } = await supabase
              .from('listings')
              .select('name, email')
              .eq('id', id)
              .single();
            if (listing?.email && listing?.name) {
              await sendSpotlightLiveEmail(listing.email, listing.name, result.storyUrl).catch((err) =>
                console.error('[admin/story_publish] spotlight email error:', err)
              );
            }
          } else if (result.skipped) {
            storyStatus = 'skipped';
            storyUrl = result.storyUrl;
            storySlug = result.postSlug;
          } else {
            storyStatus = 'failed';
            console.error('[admin/story_publish] failed:', result.error);
          }
        } catch (err) {
          console.error('[admin/story_publish] error:', err);
          storyStatus = 'failed';
        }
        break;
      }

      case 'reject': {
        if (!reason) {
          return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 });
        }

        const { data: listing, error: updateError } = await supabase
          .from('listings')
          .update({ status: 'rejected' })
          .eq('id', id)
          .select('name, email')
          .single();

        if (updateError) {
          console.error('[admin/reject] update error:', updateError);
          return NextResponse.json(
            { error: `Rejection failed: ${updateError.message}` },
            { status: 500 }
          );
        }

        // Send rejection email. Awaited — see note on the approval email above.
        if (listing?.email && listing?.name) {
          await sendRejectionEmail(listing.email, listing.name, listing.name, reason).catch((err) =>
            console.error('[admin/reject] rejection email error:', err)
          );
        }
        break;
      }

      case 'feature': {
        // Toggle is_featured
        const { data: current, error: fetchError } = await supabase
          .from('listings')
          .select('is_featured')
          .eq('id', id)
          .single();

        if (fetchError || !current) {
          return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        const { error: toggleError } = await supabase
          .from('listings')
          .update({ is_featured: !current.is_featured })
          .eq('id', id);

        if (toggleError) {
          return NextResponse.json({ error: toggleError.message }, { status: 500 });
        }
        break;
      }

      case 'verify': {
        // Toggle is_verified
        const { data: current, error: fetchError } = await supabase
          .from('listings')
          .select('is_verified')
          .eq('id', id)
          .single();

        if (fetchError || !current) {
          return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        const { error: toggleError } = await supabase
          .from('listings')
          .update({ is_verified: !current.is_verified })
          .eq('id', id);

        if (toggleError) {
          return NextResponse.json({ error: toggleError.message }, { status: 500 });
        }
        break;
      }

      case 'delete': {
        // Permanently remove the listing. Clean up dependent rows first so FK
        // constraints don't block the delete (reviews + any social-post log rows).
        await supabase.from('reviews').delete().eq('listing_id', id);
        await supabase.from('social_posts').delete().eq('ref_id', id);

        const { error: deleteError } = await supabase.from('listings').delete().eq('id', id);
        if (deleteError) {
          console.error('[admin/delete] delete error:', deleteError);
          return NextResponse.json({ error: `Delete failed: ${deleteError.message}` }, { status: 500 });
        }
        break;
      }
    }

    const responseAction = action as AdminAction;
    if (responseAction === 'approve' || responseAction === 'story' || responseAction === 'story_publish' || responseAction === 'story_regenerate') {
      return NextResponse.json({
        ok: true,
        storyStatus,
        ...(storyUrl ? { storyUrl } : {}),
        ...(storySlug ? { storySlug } : {}),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/action] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
