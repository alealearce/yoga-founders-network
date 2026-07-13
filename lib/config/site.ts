/**
 * lib/config/site.ts — Yoga Founders Network
 * Single source of truth for all brand, copy, and configuration.
 */

// ── Colors (must stay in sync with tailwind.config.ts) ──────────────────────
export const COLORS = {
  bg:               "#FAF6EF",
  surfaceLow:       "#F3EDE0",
  surfaceCard:      "#FFFDF8",
  primary:          "#231E17",
  primaryContainer: "#3A322A",
  onPrimary:        "#FAF6EF",
  secondaryContainer: "#EAE1CF",
  onSurface:        "#231E17",
  onSurfaceVariant: "#75695A",
  outlineVariant:   "#E5DCCB",
  accent:           "#A2620F",
  accentText:       "#8A530C",
} as const;

// ── Site Identity ────────────────────────────────────────────────────────────
export const SITE = {
  name:        "Yoga Founders Network",
  shortName:   "YFN",
  tagline:     "Help Yoga grow its Impact in Society",
  description: "The global directory for yoga studios, teachers, schools, retreats, and products. Discover and connect with the yoga community worldwide.",
  domain:      "yogafoundersnetwork.com",
  url:         "https://yogafoundersnetwork.com",
  email:       "hello@yogafoundersnetwork.com",
  supportEmail:"hello@yogafoundersnetwork.com",
  fromEmail:   "Yoga Founders Network <hello@yogafoundersnetwork.com>",
  social: {
    instagram: "https://instagram.com/yogafoundersnetwork/",
    linkedin:  "https://linkedin.com/company/the-yoga-founders-network/",
    facebook:  "https://facebook.com/profile.php?id=61579842675309",
  },
  logo:    "/images/logo.png",
  favicon: "/images/favicon.png",
} as const;

// ── Default social share image ───────────────────────────────────────────────
// Served by app/[locale]/opengraph-image.tsx (Digital Atrium brand card).
// Relative URL — resolved against metadataBase, and the unprefixed path is
// intl-rewritten by the middleware so it serves without a redirect hop.
// Pages that define their own `openGraph` must include this in `images`
// (or their own image) because config openGraph in a sub-segment overrides
// the file-convention image from [locale].
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE.name} — ${SITE.tagline}`,
} as const;

// ── Categories / Listing Types ───────────────────────────────────────────────
// id matches the ListingType in supabase/types.ts (singular)
export const LISTING_TYPES = [
  { id: "studio",   label: "Studios",   slug: "studios",    icon: "S" },
  { id: "teacher",  label: "Teachers",  slug: "teachers",   icon: "T" },
  { id: "school",   label: "Schools",   slug: "schools",    icon: "Sc" },
  { id: "retreat",  label: "Retreats",  slug: "retreats",   icon: "R" },
  { id: "product",  label: "Products",  slug: "products",   icon: "P" },
  { id: "workshop", label: "Workshops", slug: "workshops",  icon: "W" },
] as const;

export type ListingTypeId = typeof LISTING_TYPES[number]["id"];

// ── Founder Story questions (submit form + story pipeline) ──────────────────
export const FOUNDER_QUESTIONS = [
  { key: 'origin', label: 'What first brought you to yoga?' },
  { key: 'leap', label: 'What made you take the leap — teaching, opening your doors, or building this?' },
  { key: 'hard_truth', label: "What's the hardest part of this work that most people never see?" },
  { key: 'feeling', label: 'What do you want people to feel when they leave your class, space, or experience?' },
  { key: 'advice', label: 'What would you tell someone thinking about starting their own yoga journey or business?' },
] as const
export type FounderQuestionKey = (typeof FOUNDER_QUESTIONS)[number]['key']

// ── AI Chatbot ───────────────────────────────────────────────────────────────
export const CHATBOT = {
  name:     "Lotus",
  persona:  "You are Lotus, a warm and knowledgeable guide for the Yoga Founders Network. You help visitors discover yoga studios, teachers, retreats, schools, and products worldwide. You speak in a calm, grounded, and encouraging tone — like a trusted yoga teacher who also understands business. Keep responses concise and helpful.",
  greeting: "Namaste — I'm Lotus, your guide to the Yoga Founders Network. I can help you find studios, teachers, retreats, or anything else in our global yoga community. How can I help?",
  avatar:   "L",
} as const;

// ── Homepage Copy ────────────────────────────────────────────────────────────
export const COPY = {
  hero: {
    // headlineAccent renders as the italic turmeric line after the headline.
    headline:       "A network of the world's yoga spaces",
    headlineAccent: "and people.",
    subheadline: "Studios, teachers, schools, and retreats — every entry reviewed before it appears.",
    cta:         "Find your practice",
    ctaSecondary:"List your space",
  },
  searchPlaceholder: "Vinyasa in Lisbon, teacher training in Bali…",
  featuredSection: {
    title:    "Recently verified",
    subtitle: "Hand-picked studios, teachers, and retreats the community is loving right now.",
    cta:      "All studios",
  },
  communitySection: {
    title:    "The Journal",
    subtitle: "Insights, stories, and wisdom from the global yoga community. Every founder who joins gets their story told.",
    cta:      "Read the Journal",
  },
  submitCta: {
    title:       "Your space belongs",
    titleAccent: "in the network.",
    subtitle: "Listing is free. A real person reviews every submission — most are live within two days, with a verification mark your students can trust.",
    cta:      "List your space — free",
  },
  footer: {
    tagline: "Helping Yoga grow its Impact in Society",
  },
} as const;

// ── Newsletter ───────────────────────────────────────────────────────────────
export const NEWSLETTER = {
  title:       "Weekly Sanctuary Dispatches",
  description: "Curated yoga wisdom, studio spotlights, and community stories — delivered to your inbox every week.",
  placeholder: "Your email address",
  cta:         "Subscribe",
} as const;

// ── Admin ────────────────────────────────────────────────────────────────────
export const ADMIN = {
  secret: process.env.ADMIN_SECRET ?? "",
  emails: ["hi@arce.ca"] as readonly string[],
} as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN.emails.includes(email.toLowerCase());
}
