import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { sendStoryReceivedEmail, sendAdminStorySubmittedEmail } from '@/lib/email/resend';
import { FOUNDER_QUESTIONS } from '@/lib/config/site';

const MAX_IMAGES = 6;

const GetFeaturedSchema = z.object({
  token: z.string().uuid(),
  founder_story: z.object({
    origin:     z.string().max(1000).optional(),
    leap:       z.string().max(1000).optional(),
    hard_truth: z.string().max(1000).optional(),
    feeling:    z.string().max(1000).optional(),
    advice:     z.string().max(1000).optional(),
  }).optional(),
  new_images: z.array(z.string().url().max(500)).max(6).optional(),
});

// Only accept photo URLs that came from our own storage bucket.
// (mirrors app/api/business/submit/route.ts)
function isOwnStorageUrl(url: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!base && url.startsWith(`${base}/storage/v1/object/public/listing-images/`);
}

// Strip empty/blank answers; return null if nothing meaningful was answered.
// (mirrors app/api/business/submit/route.ts)
function cleanFounderStory(
  story: Partial<Record<'origin' | 'leap' | 'hard_truth' | 'feeling' | 'advice', string>> | undefined
): Record<string, string> | null {
  if (!story) return null;
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(story)) {
    const trimmed = value?.trim();
    if (trimmed) cleaned[key] = trimmed;
  }
  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GetFeaturedSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field = firstIssue?.path?.join('.') ?? 'unknown';
      const msg   = firstIssue?.message ?? 'Invalid input';
      return NextResponse.json(
        { error: `Invalid input: ${field} — ${msg}` },
        { status: 400 }
      );
    }

    const { token, founder_story, new_images } = parsed.data;
    const supabase = createAdminClient();

    const { data: listing, error: findError } = await supabase
      .from('listings')
      .select('id, name, email, images, story_post_id')
      .eq('invite_token', token)
      .maybeSingle();

    if (findError || !listing) {
      return NextResponse.json({ error: 'This link is invalid or has expired.' }, { status: 404 });
    }

    if (listing.story_post_id) {
      return NextResponse.json(
        { error: 'A spotlight has already been published for this listing.' },
        { status: 409 }
      );
    }

    const cleaned = cleanFounderStory(founder_story);
    const answeredCount = FOUNDER_QUESTIONS.filter((q) => cleaned?.[q.key]).length;
    if (answeredCount < 3) {
      return NextResponse.json(
        { error: 'Please answer at least 3 of the 5 questions before submitting.' },
        { status: 400 }
      );
    }

    const validNewImages = (new_images ?? []).filter(isOwnStorageUrl);
    const existingImages = listing.images ?? [];
    const mergedImages = Array.from(new Set([...existingImages, ...validNewImages])).slice(0, MAX_IMAGES);

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        founder_story: cleaned,
        images: mergedImages,
        story_opt_out: false,
      })
      .eq('id', listing.id);

    if (updateError) {
      console.error('[get-featured] update error:', updateError);
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }

    // Both emails must be awaited — Vercel kills fire-and-forget promises.
    if (listing.email) {
      await sendStoryReceivedEmail(listing.email, listing.name);
    }
    await sendAdminStorySubmittedEmail(listing.name);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[get-featured] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
