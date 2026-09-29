import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { sendLeadEmail } from '@/lib/email/resend';
import { rateLimit } from '@/lib/rateLimit';
import { refusedByGate } from '@/lib/botGate';

export const runtime = 'nodejs';

// Per-sender caps over 24h, counted in the database (the IP limit above is
// per-instance memory and misses bursts). A person asking for quotes contacts
// a few businesses; the 2026-09-28 vendorroster scam hit 23 with one message.
const MAX_LEADS_PER_EMAIL = 3;
const MAX_SAME_MESSAGE = 3;
const DAY_MS = 24 * 60 * 60_000;

const LeadSchema = z.object({
  listing_id:   z.string().uuid(),
  listing_name: z.string().min(1).max(100),
  sender_name:  z.string().min(1).max(100),
  sender_email: z.string().email(),
  message:      z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  // Rate limit: 10 lead submissions per hour per IP
  const rl = rateLimit(req, { limit: 10, windowMs: 60 * 60_000, prefix: 'leads' });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    // Refused submissions get the same answer as real ones, so a bot learns nothing.
    if (refusedByGate(body, 'lead')) return NextResponse.json({ ok: true });
    const parsed = LeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { listing_id, listing_name, sender_name, sender_email, message } = parsed.data;
    const supabase = createAdminClient();

    // Verify the listing exists and is approved
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, name, email, owner_id, status')
      .eq('id', listing_id)
      .eq('status', 'approved')
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const since = new Date(Date.now() - DAY_MS).toISOString();
    const [{ count: bySender }, { count: byMessage }] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true })
        .ilike('sender_email', sender_email.trim()).gte('created_at', since),
      supabase.from('leads').select('id', { count: 'exact', head: true })
        .eq('message', message).gte('created_at', since),
    ]);
    if ((bySender ?? 0) >= MAX_LEADS_PER_EMAIL || (byMessage ?? 0) >= MAX_SAME_MESSAGE) {
      console.warn(`[leads] capped: ${sender_email} (sender ${bySender}, same message ${byMessage})`);
      return NextResponse.json({ ok: true });
    }

    // Insert lead record
    const { error: insertError } = await supabase.from('leads').insert({
      listing_id,
      sender_name,
      sender_email,
      message,
      is_read: false,
    });

    if (insertError) {
      console.error('[leads] insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }

    // Send notification email to the listing owner (or listing email if no owner)
    const recipientEmail = listing.email;
    if (recipientEmail) {
      await sendLeadEmail(
        recipientEmail,
        sender_name,
        sender_email,
        message,
        listing.name ?? listing_name
      ).catch((err) => console.error('[leads] email error:', err));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[leads] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
