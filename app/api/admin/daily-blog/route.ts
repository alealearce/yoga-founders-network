import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/server';

// Daily cron: generate one SEO blog post for Yoga Founders Network.
// Replaces the local mcp__scheduled-tasks entry `yoga-blog-content`.
//
// Runs on Vercel Cron — see vercel.json. Authenticates via CRON_SECRET.
// Env required: ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, CRON_SECRET.

export const maxDuration = 300; // 5 min — Claude generation can be slow

const MODEL = 'claude-sonnet-4-5-20250929';

const SYSTEM_PROMPT = `You are the automated editorial system for Yoga Founders Network (yogafoundersnetwork.com) — the global directory for yoga studios, teachers, schools, retreats, and products.

Your mission: make yogafoundersnetwork.com the #1 resource for yoga students and practitioners searching for studios, teachers, and guidance. Every post targets a specific keyword with real search intent.

CONTEXT
- Listing types: Studios, Teachers, Schools, Retreat Centers, Products, Workshops
- Yoga styles: Hatha, Vinyasa, Ashtanga, Yin, Restorative, Bikram/Hot, Kundalini, Iyengar, Power, Prenatal, Chair Yoga, Aerial Yoga
- Markets: Global (US, Canada, UK, Australia, worldwide)
- Blog categories (exact IDs): finding_yoga, studio_guides, teacher_guides, wellness, yoga_lifestyle
- Content format: Markdown (the site auto-renders to HTML)
- Voice: Warm, grounded, encouraging, inclusive. Like a knowledgeable practitioner who understands the business side. Calm but authoritative. Never preachy.
- Brand identity: "The Journal" — minimal, clean aesthetic.

CONTENT TYPE ROTATION — pick the type that feels freshest vs. existing posts:
A) Finding Yoga (finding_yoga): "how to find a yoga studio near me", "how to choose a yoga teacher", "hot yoga vs regular yoga", "vinyasa vs hatha for beginners", "how to start yoga as a complete beginner", "what to expect at your first yoga class", "yoga for men beginners", "yoga for seniors", "prenatal yoga how to find a class"
B) Studio Guides (studio_guides) — city lists: "best yoga studios in [city]", "top yoga studios [city]", "best hot yoga studios [city]", "best vinyasa yoga [city]", "best yoga for beginners [city]", "best yoga retreats near [city]", "affordable yoga studios [city]". Cities: Vancouver, Toronto, Los Angeles, New York, London, San Francisco, Austin, Denver, Portland, Seattle, Miami, Chicago, Montreal, Calgary, San Diego, Bali, Costa Rica, Sydney, Melbourne.
C) Teacher Guides (teacher_guides): "how to become a yoga teacher", "yoga teacher training cost", "200 hour vs 500 hour YTT", "is yoga teacher training worth it", "how to find a yoga mentor", "yoga teaching certification requirements", "online yoga teacher training programs", "yoga teacher insurance"
D) Wellness (wellness): "benefits of yoga for [condition]" (anxiety, back pain, sleep, stress), "yoga for weight loss", "how often should you do yoga", "yoga vs pilates", "best yoga poses for [goal]", "morning yoga routine", "yoga for athletes", "yoga for desk workers"
E) Lifestyle (yoga_lifestyle): "best yoga mats", "what to wear to yoga class", "yoga props for beginners", "best yoga apps", "yoga book recommendations", "building a home yoga practice", "yoga community how to connect"

WRITING REQUIREMENTS
- 1500–2500 words of substantive, helpful content. No fluff.
- Primary keyword in: title, first paragraph, at least two H2 headings.
- Structure: strong H1, clear H2s targeting related queries, bullet points, numbered lists, a final "Key Takeaways" section.
- For city lists: describe neighborhoods, styles popular there, price ranges, 8–12 characteristics of great studios — do NOT name specific studios (this is a directory).
- For "how to choose" guides: include a checklist, red flags, questions to ask, level-appropriate advice.
- Include 1–2 internal markdown links to YFN directory pages:
  - Studios: /yogastudio
  - Teachers: /yogateacher
  - Schools: /yogaschool
  - Retreats: /retreatcenter
  - Products: /yogaproducts
  - Workshops: /yogaworkshops
  e.g. [Find yoga studios on Yoga Founders Network](/yogastudio)
- Tags: 3–5 short relevant tags as a JSON string array.
- Inclusive of all levels — beginners to advanced.

OUTPUT FORMAT
Return ONLY a JSON object (no code fences, no commentary) with these fields:
{
  "title": "compelling post title",
  "slug": "lowercase-hyphenated-slug",
  "category": "one of: finding_yoga | studio_guides | teacher_guides | wellness | yoga_lifestyle",
  "city": "City Name or null",
  "content": "full markdown body (1500–2500 words)",
  "excerpt": "1–2 sentence summary",
  "meta_title": "under 60 chars",
  "meta_description": "130–155 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "reading_time_minutes": 8,
  "cover_image": "https://images.unsplash.com/photo-...?w=1200&h=800&fit=crop&q=80"
}

Cover image: pick one of these pre-vetted Unsplash URLs, rotating so you don't repeat today's choice too close to yesterday's if possible:
- https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1588286840104-8957b019727f?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1200&h=800&fit=crop&q=80`;

export async function GET(req: NextRequest) {
  // Auth — Vercel Cron adds `Authorization: Bearer ${CRON_SECRET}` automatically when the secret is set in Vercel env.
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const supabase = createAdminClient();

  // 1. Fetch existing slugs + titles so the model avoids duplicates.
  const { data: existing, error: fetchErr } = await supabase
    .from('blog_posts')
    .select('slug, title, category, city')
    .order('published_at', { ascending: false })
    .limit(200);

  if (fetchErr) {
    console.error('[daily-blog] fetch existing error:', fetchErr);
    return NextResponse.json({ error: 'Failed to fetch existing posts' }, { status: 500 });
  }

  const existingSummary = (existing ?? [])
    .map((p) => `- ${p.slug} (${p.category}${p.city ? ', ' + p.city : ''}): ${p.title}`)
    .join('\n') || '(no posts yet)';

  // 2. Generate today's post via Claude.
  const userPrompt = `Today is ${new Date().toISOString().slice(0, 10)}.

Here are the ${existing?.length ?? 0} existing posts — DO NOT duplicate any of these slugs or cover the same angle:

${existingSummary}

Pick a fresh keyword (rotate content types A–E; prefer types under-represented above) and generate today's post as JSON per the system spec. Return ONLY the JSON object.`;

  let raw: string;
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const block = message.content[0];
    if (block.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected model response' }, { status: 500 });
    }
    raw = block.text.trim();
  } catch (err) {
    console.error('[daily-blog] anthropic error:', err);
    return NextResponse.json({ error: 'LLM call failed', detail: String(err) }, { status: 502 });
  }

  // Strip possible code fence wrapping.
  const jsonText = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let post: {
    title: string;
    slug: string;
    category: string;
    city: string | null;
    content: string;
    excerpt: string;
    meta_title: string;
    meta_description: string;
    tags: string[];
    reading_time_minutes: number;
    cover_image: string | null;
  };
  try {
    post = JSON.parse(jsonText);
  } catch (err) {
    console.error('[daily-blog] JSON parse error:', err, 'raw:', raw.slice(0, 500));
    return NextResponse.json({ error: 'Invalid JSON from model' }, { status: 500 });
  }

  // 3. Defensive slug uniqueness check.
  const { data: dup } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', post.slug)
    .maybeSingle();

  if (dup) {
    return NextResponse.json({ error: 'Generated slug already exists', slug: post.slug }, { status: 409 });
  }

  // 4. Insert.
  const { data: inserted, error: insertErr } = await supabase
    .from('blog_posts')
    .insert({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      author: 'Yoga Founders Network',
      tags: post.tags ?? [],
      category: post.category,
      city: post.city ?? null,
      is_published: true,
      published_at: new Date().toISOString(),
      reading_time_minutes: post.reading_time_minutes,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      cover_image: post.cover_image,
      generated_by: 'claude',
    })
    .select('id, slug, title')
    .single();

  if (insertErr) {
    console.error('[daily-blog] insert error:', insertErr);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  console.log(`[daily-blog] published ${inserted.slug}`);
  return NextResponse.json({ ok: true, post: inserted });
}
