import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email/resend';
import { SITE } from '@/lib/config/site';

const VALID_ACTIONS = ['approve', 'reject', 'feature', 'verify'] as const;
type AdminAction = typeof VALID_ACTIONS[number];

export async function POST(req: NextRequest) {
  // Verify admin secret
  const secret = req.headers.get('x-admin-secret');
  if (!secret || secret !== process.env.ADMIN_SECRET) {
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

        // Send approval email to listing owner
        if (listing?.email && listing?.name && listing?.slug) {
          const listingUrl = `${SITE.url}/${listing.type}/${listing.slug}`;
          sendApprovalEmail(listing.email, listing.name, listing.name, listingUrl).catch((err) =>
            console.error('[admin/approve] approval email error:', err)
          );
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

        // Send rejection email
        if (listing?.email && listing?.name) {
          sendRejectionEmail(listing.email, listing.name, listing.name, reason).catch((err) =>
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
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/action] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
