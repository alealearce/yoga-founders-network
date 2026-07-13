import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { sendWelcomeEmail, sendAdminNewListing } from '@/lib/email/resend';

const SubmitSchema = z.object({
  name:        z.string().min(2).max(100),
  type:        z.enum(['studio', 'teacher', 'school', 'retreat', 'product', 'workshop']),
  email:       z.string().email(),
  website:     z.string().url().optional().or(z.literal('')),
  phone:       z.string().max(30).optional(),
  address:     z.string().max(200).optional().or(z.literal('')),
  city:        z.string().min(2).max(100),
  country:     z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  yoga_styles: z.array(z.string().max(60)).max(20).optional(),
  languages:   z.array(z.string().max(40)).max(20).optional(),
  tagline:     z.string().max(200).optional(),
  yoga_alliance_id: z.string().max(60).optional().or(z.literal('')),
  images:      z.array(z.string().url().max(500)).max(6).optional(),
  price_range: z.enum(['$', '$$', '$$$']).optional().or(z.literal('')),
  social_instagram: z.string().max(300).optional().or(z.literal('')),
  social_facebook:  z.string().max(300).optional().or(z.literal('')),
  social_youtube:   z.string().max(300).optional().or(z.literal('')),
  social_tiktok:    z.string().max(300).optional().or(z.literal('')),
  founder_story: z.object({
    origin:     z.string().max(1000).optional(),
    leap:       z.string().max(1000).optional(),
    hard_truth: z.string().max(1000).optional(),
    feeling:    z.string().max(1000).optional(),
    advice:     z.string().max(1000).optional(),
  }).optional(),
  founder_images: z.array(z.string().url().max(500)).max(3).optional(),
  story_opt_out:  z.boolean().optional().default(false),
});

// Only accept photo URLs that came from our own storage bucket.
function isOwnStorageUrl(url: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!base && url.startsWith(`${base}/storage/v1/object/public/listing-images/`);
}

// Accept full URLs or bare handles ("@mystudio" / "mystudio") and normalize
// to a URL, since the listing page renders these as plain hrefs.
function normalizeSocial(input: string | undefined, kind: 'instagram' | 'facebook' | 'youtube' | 'tiktok'): string | null {
  const v = input?.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, '').replace(/^\/+/, '');
  if (kind === 'youtube') return `https://youtube.com/@${handle}`;
  if (kind === 'tiktok')  return `https://tiktok.com/@${handle}`;
  return `https://${kind}.com/${handle}`;
}

// Strip empty/blank answers; return null if nothing meaningful was answered.
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

function slugify(name: string, city: string): string {
  const base = `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SubmitSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field = firstIssue?.path?.join('.') ?? 'unknown';
      const msg   = firstIssue?.message ?? 'Invalid input';
      return NextResponse.json(
        { error: `Invalid input: ${field} — ${msg}` },
        { status: 400 }
      );
    }

    const {
      name, type, email, website, phone, address,
      city, country, description, yoga_styles, languages, tagline,
      yoga_alliance_id, images, price_range,
      social_instagram, social_facebook, social_youtube, social_tiktok,
      founder_story, founder_images, story_opt_out,
    } = parsed.data;

    const supabase = createAdminClient();
    const slug = slugify(name, city ?? '');

    const { error: insertError } = await supabase.from('listings').insert({
      name,
      slug,
      type:          type as import('@/lib/supabase/types').ListingType,
      email,
      website:       website  || null,
      phone:         phone    || null,
      address:       address  || null,
      city:          city,
      country:       country  || null,
      description:   description || null,
      tagline:       tagline  || null,
      yoga_styles:   yoga_styles ?? [],
      status:        'pending',
      is_featured:   false,
      is_verified:   false,
      owner_id:      null,
      images:        (images ?? []).filter(isOwnStorageUrl),
      experience_levels: [],
      languages:     languages ?? [],
      plan:          'free',
      yoga_alliance_id: yoga_alliance_id || null,
      price_range:   price_range || null,
      social_instagram: normalizeSocial(social_instagram, 'instagram'),
      social_facebook:  normalizeSocial(social_facebook,  'facebook'),
      social_youtube:   normalizeSocial(social_youtube,   'youtube'),
      social_tiktok:    normalizeSocial(social_tiktok,    'tiktok'),
      founder_story:  cleanFounderStory(founder_story),
      founder_images: (founder_images ?? []).filter(isOwnStorageUrl),
      story_opt_out:  story_opt_out ?? false,
    });

    if (insertError) {
      console.error('[business/submit] insert error:', insertError);
      return NextResponse.json(
        { error: `DB error: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Send emails — fire-and-forget to keep response fast
    sendWelcomeEmail(email, name).catch((err) =>
      console.error('[business/submit] welcome email error:', err)
    );
    sendAdminNewListing(name, type, email).catch((err) =>
      console.error('[business/submit] admin email error:', err)
    );

    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (err) {
    console.error('[business/submit] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
