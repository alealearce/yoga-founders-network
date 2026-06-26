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

// ── Mission content ──────────────────────────────────────────────────────────
// Every second post advances YFN's mission: grow yoga's impact in society.
const MISSION_TOPICS = [
  'Funding scholarship programs that put yoga into underserved schools, prisons, and shelters',
  'Training instructors in trauma-informed and adaptive yoga for disabled bodies',
  'Subsidizing studio access in low-income neighborhoods',
  'Building a sliding-scale / "pay-it-forward" class network across member studios',
  "Developing culturally responsive curricula that honor yoga's South Asian roots",
  'Partnering with hospitals and clinics to position yoga as complementary care for chronic pain, anxiety, and PTSD',
  "Commissioning and publishing research that validates yoga's clinical outcomes",
  'Creating referral pipelines between physicians and certified yoga therapists',
  'Building yoga programs for cancer recovery, addiction recovery, and veterans',
  'Pushing for insurance reimbursement of yoga therapy',
  'Setting ethical and safety standards that raise public trust in the field',
  'Creating fair-pay frameworks so teaching yoga becomes a sustainable career',
  'Offering business and marketing training so studio founders survive financially',
  'Building a shared insurance, benefits, or co-op model for independent teachers',
  'Establishing a credentialing standard that signals quality to the public',
  'Bringing yoga and mindfulness into K-12 curricula',
  'Training non-yoga educators in classroom breathing and focus techniques',
  'Creating youth leadership programs that use yoga as the vehicle',
  'Developing digital curricula for at-home family practice',
  'Designing corporate wellness programs that actually reduce burnout',
  'Partnering with first-responder and frontline organizations for stress resilience',
  'Bringing yoga into government and civic wellness initiatives',
  'Hosting regional gatherings and a national conference to unite founders',
  'Creating a mentorship program pairing established and emerging founders',
  'Building a public-facing directory so people can find vetted local studios',
  'Organizing community service days — free public classes in parks and at events',
  "Running a content engine that reframes yoga's value beyond fitness",
  'Producing free libraries of accessible online content',
  'Advocating against cultural appropriation and for authentic representation',
  'Tracking and publishing a collective impact report quantifying social outcomes',
  'Creating a grant fund members contribute to, redistributed to high-impact community projects',
  'Building measurement infrastructure so "impact" is defined and tracked, not just claimed',
];

const MISSION_SYSTEM_PROMPT = `You are the editorial voice of Yoga Founders Network (yogafoundersnetwork.com). Our mission: grow yoga's impact in society.

A "Mission" post is a thought-leadership + advocacy piece that makes the case for — and gives a practical roadmap toward — one specific way the yoga community can expand yoga's positive impact. It rallies studio founders, teachers, and practitioners around a shared cause while staying genuinely useful and search-friendly.

VOICE: warm, grounded, inspiring but never preachy or vague. Conviction backed by specifics. Honors yoga's South Asian roots. Inclusive of all levels and bodies. Visionary yet practical.

EACH POST should:
- Take ONE mission topic and explore it deeply: why it matters, the current gap, what's possible, and concrete steps studios/teachers/the network can take.
- Be 1500–2500 words of substantive, non-fluffy content. Strong H1, clear H2s, bullet/numbered lists, a practical "Where to start" or "How you can help" section, and a final "Key Takeaways".
- Target real search intent where natural (e.g. "yoga in schools", "trauma-informed yoga training", "yoga therapy insurance", "accessible yoga", "yoga for veterans").
- Include 1–2 internal markdown links to YFN directory pages where relevant: /yogastudio, /yogateacher, /yogaschool, /retreatcenter, /yogaworkshops. e.g. [Find a studio near you](/yogastudio).
- End by inviting the reader to be part of the movement (join the network, list their space, or share the message).

OUTPUT FORMAT
Return ONLY a JSON object (no code fences, no commentary) with these fields:
{
  "title": "compelling, mission-driven post title",
  "slug": "lowercase-hyphenated-slug",
  "category": "mission",
  "city": null,
  "content": "full markdown body (1500–2500 words)",
  "excerpt": "1–2 sentence summary",
  "meta_title": "under 60 chars",
  "meta_description": "130–155 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "reading_time_minutes": 8,
  "cover_image": "pick ONE of these pre-vetted Unsplash URLs"
}

Cover image — pick one:
- https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1588286840104-8957b019727f?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=800&fit=crop&q=80
- https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1200&h=800&fit=crop&q=80`;

// Forced-tool schema — guarantees well-formed structured output (the model fills
// typed fields instead of hand-writing a JSON string, which broke on long,
// quote-heavy markdown bodies).
const PUBLISH_TOOL = {
  name: 'publish_post',
  description: 'Publish the generated blog post with all required fields.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string' },
      slug: { type: 'string', description: 'lowercase-hyphenated-slug' },
      category: { type: 'string' },
      city: { type: ['string', 'null'], description: 'City name, or null' },
      content: { type: 'string', description: 'Full markdown body, 1500–2500 words' },
      excerpt: { type: 'string' },
      meta_title: { type: 'string' },
      meta_description: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      reading_time_minutes: { type: 'number' },
      cover_image: { type: 'string' },
    },
    required: ['title', 'slug', 'category', 'content', 'excerpt', 'meta_title', 'meta_description', 'tags', 'reading_time_minutes', 'cover_image'],
  },
};

export async function GET(req: NextRequest) {
  // Auth — Vercel Cron adds `Authorization: Bearer ${CRON_SECRET}` automatically when the secret is set in Vercel env.
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dry = req.nextUrl.searchParams.get('dry') === '1';
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

  // 2. Decide today's mode — alternate SEO/directory posts with mission posts.
  //    Strict alternation off the most recent post so schedule gaps don't drift.
  const lastCategory = (existing ?? [])[0]?.category ?? null;
  const mode: 'seo' | 'mission' = lastCategory === 'mission' ? 'seo' : 'mission';
  const date = new Date().toISOString().slice(0, 10);

  let systemPrompt: string;
  let userPrompt: string;

  if (mode === 'mission') {
    const missionDone =
      (existing ?? [])
        .filter((p) => p.category === 'mission')
        .map((p) => `- ${p.title}`)
        .join('\n') || '(none yet)';
    const menu = MISSION_TOPICS.map((t, i) => `${i + 1}. ${t}`).join('\n');
    systemPrompt = MISSION_SYSTEM_PROMPT;
    userPrompt = `Today is ${date}. Write today's MISSION post — a thought-leadership + advocacy piece on one way to grow yoga's impact in society.

Mission posts ALREADY published (do NOT repeat these angles):
${missionDone}

Topic menu — choose ONE fresh angle not yet covered (or a closely related, more specific take on one):
${menu}

Submit the finished post by calling the publish_post tool, with category set to "mission" and city null.`;
  } else {
    systemPrompt = SYSTEM_PROMPT;
    userPrompt = `Today is ${date}.

Here are the ${existing?.length ?? 0} existing posts — DO NOT duplicate any of these slugs or cover the same angle:

${existingSummary}

Pick a fresh keyword (rotate content types A–E; prefer types under-represented above) and generate today's post per the system spec. Submit it by calling the publish_post tool.`;
  }

  type GeneratedPost = {
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

  let post: GeneratedPost;
  try {
    // Force the model to return structured data via the publish_post tool — the
    // SDK hands back already-parsed `input`, so no fragile JSON.parse of the body.
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: systemPrompt,
      tools: [PUBLISH_TOOL],
      tool_choice: { type: 'tool', name: 'publish_post' },
      messages: [{ role: 'user', content: userPrompt }],
    });
    const toolBlock = message.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      console.error('[daily-blog] no tool_use block; stop_reason:', message.stop_reason);
      return NextResponse.json({ error: 'Model did not return a post' }, { status: 502 });
    }
    post = toolBlock.input as GeneratedPost;
  } catch (err) {
    console.error('[daily-blog] anthropic error:', err);
    return NextResponse.json({ error: 'LLM call failed', detail: String(err) }, { status: 502 });
  }

  if (!post?.title || !post?.slug || !post?.content) {
    return NextResponse.json({ error: 'Model returned an incomplete post' }, { status: 502 });
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

  // Preview mode — return the generated post without inserting.
  if (dry) {
    return NextResponse.json({
      ok: true,
      dry: true,
      mode,
      post: { title: post.title, slug: post.slug, category: post.category, excerpt: post.excerpt, reading_time_minutes: post.reading_time_minutes },
    });
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
