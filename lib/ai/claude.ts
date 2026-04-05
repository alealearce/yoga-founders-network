import Anthropic from '@anthropic-ai/sdk';
import type { Listing } from '@/lib/supabase/types';
import { SITE, CHATBOT } from '@/lib/config/site';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Chatbot ────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// System prompt is built from site config — no hardcoded brand values here
const CHATBOT_SYSTEM = `You are ${CHATBOT.name}, ${CHATBOT.persona} for ${SITE.name}. You help users:
- Find the right yoga studio, teacher, school, retreat, or workshop for their practice
- Navigate the ${SITE.name} directory
- Understand the different yoga styles (Hatha, Vinyasa, Ashtanga, Yin, Kundalini, Bikram, Iyengar, Restorative, etc.)
- Discover yoga communities and resources across the globe

Keep answers concise (2-3 sentences max).

IMPORTANT: If a user is frustrated, upset, complaining, has a technical issue, an account problem, a billing question, or asks about something you truly cannot help with, always respond kindly AND include this exactly: "For direct help, email us at ${SITE.supportEmail} — we usually respond within 24 hours!"

Never invent specific class schedules, prices, or instructor availability.`;

export async function chatWithAssistant(messages: ChatMessage[]): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    system: CHATBOT_SYSTEM,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

// ── Long Description Generation (500-800 words) ──────────────────────────

interface LongDescriptionResult {
  long_description: string;
}

export async function generateLongDescription(
  listing: Partial<Listing>
): Promise<LongDescriptionResult> {
  const prompt = `You are writing a detailed, SEO-optimized listing description for ${SITE.name} — a global yoga directory connecting students with studios, teachers, schools, and retreats.

Listing: "${listing.name}"
Type: ${listing.type}
City: ${listing.city}${listing.country ? `, ${listing.country}` : ''}
${listing.yoga_styles && listing.yoga_styles.length > 0 ? `Yoga Styles: ${listing.yoga_styles.join(', ')}` : ''}
${listing.experience_levels && listing.experience_levels.length > 0 ? `Experience Levels: ${listing.experience_levels.join(', ')}` : ''}
${listing.languages && listing.languages.length > 0 ? `Languages: ${listing.languages.join(', ')}` : ''}
${listing.description ? `Short description: ${listing.description}` : ''}

Write a comprehensive listing description (500-800 words):
- Warm, inviting, and authentic tone appropriate for the yoga community
- Highlight the unique qualities of this studio/teacher/school — the atmosphere, teaching philosophy, and transformative experience offered
- Mention yoga styles taught and what students can expect from their practice here
- Include natural keyword usage for local and style-based SEO
- Mention the city naturally
- Use paragraphs, not bullet points

IMPORTANT: Write at least 500 words. Be thorough, evocative, and detailed.

Respond in this exact JSON format:
{
  "long_description": "..."
}`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

  try {
    return JSON.parse(text) as LongDescriptionResult;
  } catch {
    return {
      long_description: '',
    };
  }
}

// ── Short Description Generator (for listing submission "Let AI write it") ──────

interface ShortDescriptionResult {
  description: string;
}

export async function generateShortDescription(input: {
  name: string;
  type: string;
  city: string;
  country?: string;
  yoga_styles?: string[];
  experience_levels?: string[];
  website?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  keywords?: string;
}): Promise<ShortDescriptionResult> {
  const socialSignals = [
    input.instagram && `Instagram: @${input.instagram.replace('@', '')}`,
    input.facebook && `Facebook: ${input.facebook}`,
    input.youtube && `YouTube: ${input.youtube}`,
  ].filter(Boolean).join('\n');

  const prompt = `You are ${CHATBOT.name}, a helpful content writer for ${SITE.name} — a global yoga directory.

Write a short, engaging listing description (3-5 sentences) for this yoga listing:

Name: ${input.name}
Type: ${input.type}
City: ${input.city}${input.country ? `, ${input.country}` : ''}${input.yoga_styles && input.yoga_styles.length > 0 ? `\nYoga Styles: ${input.yoga_styles.join(', ')}` : ''}${input.experience_levels && input.experience_levels.length > 0 ? `\nExperience Levels: ${input.experience_levels.join(', ')}` : ''}${input.website ? `\nWebsite: ${input.website}` : ''}${socialSignals ? `\nSocial media:\n${socialSignals}` : ''}${input.keywords ? `\nKeywords/tags: ${input.keywords}` : ''}

Guidelines:
- Warm, inviting, authentic tone appropriate for the yoga community
- Highlight what makes this listing special and why students should connect with them
- Naturally mention the city and yoga styles for SEO
- 3-5 sentences, no bullet points
- Do NOT invent specific class schedules, prices, or facts not provided

Respond with ONLY the description text — no labels, no JSON, no extra commentary.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
  return { description: text };
}

// ── Listing AI Enrichment ─────────────────────────────────────────────────

interface EnrichmentResult {
  description: string;
  tags: string[];
}

export async function enrichListing(
  listing: Partial<Listing>
): Promise<EnrichmentResult> {
  const prompt = `You are enriching a yoga directory listing for: "${listing.name}" in ${listing.city}${listing.country ? `, ${listing.country}` : ''}.
Type: ${listing.type}
${listing.yoga_styles && listing.yoga_styles.length > 0 ? `Yoga Styles: ${listing.yoga_styles.join(', ')}` : ''}

Write a SHORT description (2-3 sentences) — warm, authentic, highlights what makes this yoga listing stand out and why students would love practicing here.

Also suggest 3-5 relevant tags (comma-separated, lowercase, e.g. vinyasa, beginners-welcome, meditation, hot-yoga).

Respond in this exact JSON format:
{
  "description": "...",
  "tags": ["tag1", "tag2"]
}`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';

  try {
    return JSON.parse(text) as EnrichmentResult;
  } catch {
    return {
      description: `${listing.name} is a yoga ${listing.type} based in ${listing.city}.`,
      tags: [],
    };
  }
}
