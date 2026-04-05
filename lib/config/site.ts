/**
 * lib/config/site.ts — Yoga Founders Network
 * Single source of truth for all brand, copy, and configuration.
 */

// ── Colors (must stay in sync with tailwind.config.ts) ──────────────────────
export const COLORS = {
  bg:               "#fafaf5",
  surfaceLow:       "#f4f4ef",
  surfaceCard:      "#ffffff",
  primary:          "#536046",
  primaryContainer: "#6b795d",
  onPrimary:        "#ffffff",
  secondaryContainer: "#dde5d4",
  onSurface:        "#1a1c19",
  onSurfaceVariant: "#43483e",
  outlineVariant:   "#c5c8bd",
} as const;

// ── Site Identity ────────────────────────────────────────────────────────────
export const SITE = {
  name:        "Yoga Founders Network",
  shortName:   "YFN",
  tagline:     "Help Yoga grow its Impact in Society",
  description: "The global directory for yoga studios, teachers, schools, retreats, and products. Discover and connect with the yoga community worldwide.",
  domain:      "yogafoundersnetwork.com",
  url:         "https://yogafoundersnetwork.com",
  email:       "info@yogafoundersnetwork.com",
  supportEmail:"info@yogafoundersnetwork.com",
  fromEmail:   "Yoga Founders Network <info@yogafoundersnetwork.com>",
  social: {
    instagram: "https://instagram.com/yogafoundersnetwork/",
    linkedin:  "https://linkedin.com/company/the-yoga-founders-network/",
    facebook:  "https://facebook.com/profile.php?id=61579842675309",
  },
  logo:    "/images/logo.png",
  favicon: "/images/favicon.png",
} as const;

// ── Categories / Listing Types ───────────────────────────────────────────────
export const LISTING_TYPES = [
  { id: "studios",   label: "Studios",   slug: "studios",   icon: "🧘" },
  { id: "teachers",  label: "Teachers",  slug: "teachers",  icon: "👤" },
  { id: "schools",   label: "Schools",   slug: "schools",   icon: "🎓" },
  { id: "retreats",  label: "Retreats",  slug: "retreats",  icon: "🌿" },
  { id: "products",  label: "Products",  slug: "products",  icon: "🪷" },
  { id: "workshops", label: "Workshops", slug: "workshops",  icon: "✨" },
] as const;

export type ListingTypeId = typeof LISTING_TYPES[number]["id"];

// ── AI Chatbot ───────────────────────────────────────────────────────────────
export const CHATBOT = {
  name:     "Lotus",
  persona:  "You are Lotus, a warm and knowledgeable guide for the Yoga Founders Network. You help visitors discover yoga studios, teachers, retreats, schools, and products worldwide. You speak in a calm, grounded, and encouraging tone — like a trusted yoga teacher who also understands business. Keep responses concise and helpful.",
  greeting: "Namaste 🙏 I'm Lotus, your guide to the Yoga Founders Network. I can help you find studios, teachers, retreats, or anything else in our global yoga community. How can I help?",
  avatar:   "🪷",
} as const;

// ── Homepage Copy ────────────────────────────────────────────────────────────
export const COPY = {
  hero: {
    headline:    "The space to\nbreathe.",
    subheadline: "Discover yoga studios, teachers, retreats, and schools from around the world. Your global yoga community starts here.",
    cta:         "Find Your Practice",
    ctaSecondary:"List Your Space",
  },
  searchPlaceholder: "Search studios, teachers, retreats...",
  featuredSection: {
    title:    "Our favourites this month",
    subtitle: "Hand-picked studios, teachers, and retreats the community is loving right now.",
    cta:      "Discover more",
  },
  communitySection: {
    title:    "The Journal",
    subtitle: "Insights, stories, and wisdom from the global yoga community.",
    cta:      "Read the Journal",
  },
  submitCta: {
    title:    "Are you a yoga founder?",
    subtitle: "Join thousands of studios, teachers, and schools already in our directory.",
    cta:      "Submit Your Listing",
  },
  footer: {
    tagline: "Help Yoga grow its Impact in Society",
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
} as const;
