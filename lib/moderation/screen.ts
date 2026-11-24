/**
 * Auto-approve screen for new listings and Member Spotlight drafts.
 *
 * Alejandro approved every real submission by hand (44 of 45 from August to
 * November 2026), so a clean submission now goes live on its own and only the
 * doubtful ones wait for him. Everything here is a pure function with no
 * server imports, so tests/moderation.test.ts can run it against real rows.
 *
 * A reason is a plain sentence: it is shown to him in the "needs your review"
 * email as written.
 */

import { FOUNDER_QUESTIONS, type FounderQuestionKey } from '@/lib/config/site';

// ─────────────────────────────── listings ────────────────────────────────────

export type ScreenInput = {
  name: string;
  type: string;
  email: string;
  website?: string | null;
  description?: string | null;
  tagline?: string | null;
  founder_story?: Partial<Record<string, string>> | null;
};

export type ScreenContext = {
  /** Form submissions in the last 24 hours, this one included. */
  submissionsLast24h: number;
  /** Other listings that share this website host or this email. */
  related: { name: string; type: string; status: string; sameHost: boolean; sameEmail: boolean }[];
};

/** More than this many submissions in a day is a flood, not growth (normal is under one a day). */
export const DAILY_AUTO_APPROVE_CAP = 8;
const MIN_DESCRIPTION = 30;

// Things a yoga directory never sells. Whole words only.
const SPAM_TERMS = [
  'casino', 'casinos', 'betting', 'gambling', 'poker', 'slots', 'jackpot', 'sportsbook',
  'escort', 'escorts', 'call girl', 'call girls', 'porn', 'xxx', 'sex toys', 'adult dating',
  'viagra', 'cialis', 'steroids', 'weight loss pills', 'diet pills',
  'crypto', 'bitcoin', 'forex', 'binary options', 'payday loan', 'payday loans', 'loan offer',
  'seo services', 'seo agency', 'backlink', 'backlinks', 'link building', 'guest post', 'guest posting',
  'buy followers', 'essay writing', 'assignment help', 'hire a hacker', 'hacker for hire',
  'replica watches', 'fake id', 'vape', 'vapes',
];

// Any one of these, anywhere in the name, tagline, description or website,
// is enough to call the listing on topic. Deliberately wide: he approved
// pilates, tai chi, wellness clubs and harmonium makers.
const TOPIC_PATTERN = new RegExp(
  [
    'yog', 'meditat', 'pilates', 'ayurved', 'retreat', 'ashram', 'mindful', 'breath', 'pranayam',
    'wellness', 'wellbeing', 'well-being', 'tai ?chi', 'qi ?gong', 'reiki', 'sound (bath|healing)',
    'kirtan', 'mantra', 'asana', 'vinyasa', 'hatha', 'ashtanga', 'kundalini', 'iyengar', 'chakra',
    'holistic', 'teacher training', 'ytt', 'spiritual', 'harmonium', 'somatic', 'barre',
  ].join('|'),
  'i'
);

const DISPOSABLE_EMAIL = /@(mailinator|guerrillamail|sharklasers|yopmail|tempmail|temp-mail|10minutemail|trashmail|getnada|maildrop|dispostable)\./i;

function hasWord(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
}

export function spamTermsIn(text: string): string[] {
  return SPAM_TERMS.filter((t) => hasWord(text, t));
}

function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\.[a-z0-9-]+\.[a-z]/gi) ?? []).length;
}

export function websiteHost(website: string | null | undefined): string | null {
  if (!website) return null;
  try {
    return new URL(website).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

// A profile on one of these is not "the same website" as another profile there.
const SHARED_HOSTS = /(^|\.)(youtube\.com|youtu\.be|instagram\.com|facebook\.com|linktr\.ee|tiktok\.com|wixsite\.com|wordpress\.com|blogspot\.com|google\.com|business\.site|mindbodyonline\.com|linkedin\.com)$/;

export function isSharedHost(host: string): boolean {
  return SHARED_HOSTS.test(host);
}

/** Reasons to hold a new listing for Alejandro. Empty = clean. */
export function screenListing(input: ScreenInput, ctx: ScreenContext): string[] {
  const reasons: string[] = [];
  const description = (input.description ?? '').trim();
  const storyText = Object.values(input.founder_story ?? {}).filter(Boolean).join(' ');
  const publicText = [input.name, input.tagline ?? '', description, storyText].join(' \n ');

  const spam = spamTermsIn(publicText);
  if (spam.length) reasons.push(`Uses words a yoga listing should not need: ${spam.join(', ')}.`);

  if (!TOPIC_PATTERN.test(`${publicText} ${websiteHost(input.website) ?? ''}`)) {
    reasons.push('Nothing in the name, description or website says yoga, meditation or wellness.');
  }

  if (description.length < MIN_DESCRIPTION) {
    reasons.push(description ? 'The description is only a few words.' : 'There is no description.');
  }

  if (/<\s*a\s|<\s*script|\[url=/i.test(publicText)) reasons.push('The text contains link or script code.');
  if (countLinks(`${description} ${input.tagline ?? ''} ${storyText}`) > 1) {
    reasons.push('The text contains more than one web link.');
  }

  if (DISPOSABLE_EMAIL.test(input.email)) reasons.push('The email is a throwaway address.');

  for (const other of ctx.related) {
    if (other.status === 'rejected') {
      reasons.push(`You rejected "${other.name}" from the same ${other.sameEmail ? 'email' : 'website'} before.`);
    } else if (other.sameHost && other.type === input.type) {
      reasons.push(`Possible duplicate: "${other.name}" (${other.type}, ${other.status}) uses the same website.`);
    }
  }

  if (ctx.submissionsLast24h > DAILY_AUTO_APPROVE_CAP) {
    reasons.push(`${ctx.submissionsLast24h} listings came in over the last 24 hours, far more than usual.`);
  }

  return reasons;
}

// ───────────────────────────── spotlight drafts ──────────────────────────────

export type DraftInput = { title: string; content: string; pull_quote: string | null };
export type DraftSource = {
  name: string;
  description?: string | null;
  tagline?: string | null;
  founder_story: Partial<Record<string, string>> | null;
};

/** Too little of the founder's own words makes a post that is mostly filler. */
const MIN_ANSWER_CHARS = 300;
const MIN_WORDS = 300;
const MAX_WORDS = 1000;
/** Shorter quoted bits are titles and single words, not quotes of the founder. */
const MIN_QUOTE_CHARS = 25;

/** Lowercase, straight quotes, single spaces: compares wording, not typography. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Text the model put in quotation marks, so presented as the founder's words. */
export function quotedPassages(markdown: string): string[] {
  const text = markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, ' '); // image lines are not quotes
  const found: string[] = [];
  for (const m of text.matchAll(/\u201C([^\u201C\u201D]+)\u201D|"([^"\n]+)"/g)) {
    const passage = (m[1] ?? m[2] ?? '').trim();
    if (passage.length >= MIN_QUOTE_CHARS) found.push(passage);
  }
  return found;
}

function stripEdges(text: string): string {
  return text.replace(/^[\s.,;:!?'"\-]+|[\s.,;:!?'"\-]+$/g, '');
}

/** True when every part of the passage (split on "...") is in the source word for word. */
function isVerbatim(passage: string, source: string): boolean {
  const parts = normalizeText(passage).split('...').map(stripEdges).filter((p) => p.length > 0);
  return parts.length > 0 && parts.every((p) => source.includes(p));
}

function founderAnswers(story: DraftSource['founder_story']): string[] {
  return FOUNDER_QUESTIONS
    .map((q) => story?.[q.key as FounderQuestionKey]?.trim() ?? '')
    .filter((a) => a.length > 0);
}

/**
 * Reasons to hold a generated spotlight for Alejandro. Empty = publish.
 * The check that matters most: nothing sits in quotation marks unless the
 * founder wrote it. A made-up quote under a real person's name is the one
 * mistake an automatic publish must never make.
 */
export function checkSpotlightDraft(draft: DraftInput, source: DraftSource): string[] {
  const reasons: string[] = [];
  const answers = founderAnswers(source.founder_story);
  const answerText = answers.join(' ');

  if (answerText.length < MIN_ANSWER_CHARS) {
    reasons.push(`The founder wrote very little (${answerText.length} characters over ${answers.length} answers).`);
  }
  const spam = spamTermsIn(answerText);
  if (spam.length) reasons.push(`The answers use words a spotlight should not carry: ${spam.join(', ')}.`);
  if (countLinks(answerText) > 0) reasons.push('The answers contain a web link.');

  if (!/^(welcome to the network|member spotlight):/i.test(draft.title.trim())) {
    reasons.push(`The title does not follow the welcome or spotlight pattern: "${draft.title}".`);
  }
  if (/\bstor(y|ies)\b/i.test(draft.title)) reasons.push('The title uses the word "story".');

  const words = draft.content.trim().split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS || words > MAX_WORDS) reasons.push(`The post is ${words} words (expected 500 to 700).`);

  if (/\p{Extended_Pictographic}/u.test(`${draft.title} ${draft.content}`)) reasons.push('The post contains an emoji.');

  const quoteSource = normalizeText(
    [...answers, source.description ?? '', source.tagline ?? '', source.name].join(' \n ')
  );
  const invented = quotedPassages(draft.content).filter((p) => !isVerbatim(p, quoteSource));
  if (invented.length) {
    reasons.push(
      `${invented.length} quote${invented.length > 1 ? 's are' : ' is'} not word for word from the founder: "${invented[0].slice(0, 140)}"`
    );
  }
  if (!draft.pull_quote || !isVerbatim(draft.pull_quote, normalizeText(answerText))) {
    reasons.push('The pull quote for the social graphic is not word for word from the answers.');
  }

  // "story" in the body is against the house rule, but a founder may say it themselves.
  const ownWords = draft.content.replace(/\u201C[^\u201C\u201D]+\u201D|"[^"\n]+"/g, ' ');
  if (/\bstor(y|ies)\b/i.test(ownWords)) reasons.push('The post uses the word "story" outside a quote.');

  return reasons;
}
