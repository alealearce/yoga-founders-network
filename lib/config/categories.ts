/**
 * lib/config/categories.ts — Yoga Founders Network
 * Yoga style / practice categories used for filtering listings.
 */

export interface YogaCategory {
  id:          string;
  slug:        string;
  label:       string;
  icon:        string;
  description: string;
  styles:      string[];  // sub-styles / tags
}

export const YOGA_CATEGORIES: YogaCategory[] = [
  {
    id:    "hatha",
    slug:  "hatha",
    label: "Hatha",
    icon:  "☀️",
    description: "The foundational physical practice of yoga — breath, postures, and balance.",
    styles: ["Hatha Flow", "Gentle Hatha", "Traditional Hatha", "Sivananda"],
  },
  {
    id:    "vinyasa",
    slug:  "vinyasa",
    label: "Vinyasa",
    icon:  "🌊",
    description: "Dynamic, breath-synchronized movement flowing from pose to pose.",
    styles: ["Vinyasa Flow", "Power Vinyasa", "Slow Flow", "Baptiste"],
  },
  {
    id:    "ashtanga",
    slug:  "ashtanga",
    label: "Ashtanga",
    icon:  "🔥",
    description: "A rigorous, set-sequence practice rooted in the Mysore tradition.",
    styles: ["Mysore", "Led Ashtanga", "Primary Series", "Secondary Series"],
  },
  {
    id:    "yin",
    slug:  "yin",
    label: "Yin",
    icon:  "🌙",
    description: "Long-held, passive poses targeting deep connective tissue and fascia.",
    styles: ["Yin Yoga", "Yin / Yang", "Restorative Yin"],
  },
  {
    id:    "restorative",
    slug:  "restorative",
    label: "Restorative",
    icon:  "🛌",
    description: "Deeply supportive poses using props for full nervous system rest.",
    styles: ["Restorative", "Yoga Nidra", "iRest"],
  },
  {
    id:    "kundalini",
    slug:  "kundalini",
    label: "Kundalini",
    icon:  "🌀",
    description: "A spiritual and dynamic practice combining breathwork, mantra, and movement.",
    styles: ["Kundalini as Taught by Yogi Bhajan", "Shakti Yoga"],
  },
  {
    id:    "iyengar",
    slug:  "iyengar",
    label: "Iyengar",
    icon:  "📐",
    description: "Precise alignment and the therapeutic use of props.",
    styles: ["Iyengar", "Therapeutic Yoga"],
  },
  {
    id:    "bikram",
    slug:  "bikram",
    label: "Hot Yoga",
    icon:  "🌡️",
    description: "Yoga practiced in a heated room — detoxifying and physically challenging.",
    styles: ["Bikram", "Hot Vinyasa", "Inferno Hot Pilates", "Hot Yin"],
  },
  {
    id:    "meditation",
    slug:  "meditation",
    label: "Meditation",
    icon:  "🧘",
    description: "Seated and moving meditation practices for mind and spirit.",
    styles: ["Mindfulness", "Vipassana", "Zen", "Loving-Kindness", "Breathwork"],
  },
  {
    id:    "prenatal",
    slug:  "prenatal",
    label: "Prenatal & Postnatal",
    icon:  "🤰",
    description: "Specially designed yoga for pregnancy and postpartum recovery.",
    styles: ["Prenatal Yoga", "Postnatal Yoga", "Mom & Baby"],
  },
  {
    id:    "aerial",
    slug:  "aerial",
    label: "Aerial & Acro",
    icon:  "🎪",
    description: "Yoga and acrobatics using hammocks, silks, or a partner.",
    styles: ["Aerial Yoga", "AcroYoga", "Hammock Yoga"],
  },
  {
    id:    "other",
    slug:  "other",
    label: "Other Styles",
    icon:  "✨",
    description: "Jivamukti, Forrest, Anusara, Integral, and more.",
    styles: ["Jivamukti", "Forrest Yoga", "Anusara", "Integral Yoga", "Tantra"],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
export function getCategoryById(id: string): YogaCategory | undefined {
  return YOGA_CATEGORIES.find(c => c.id === id);
}

export function getCategoryBySlug(slug: string): YogaCategory | undefined {
  return YOGA_CATEGORIES.find(c => c.slug === slug);
}

// ── Listing-type specific filters ────────────────────────────────────────────
export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"] as const;
export const LISTING_LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Japanese", "Chinese", "Hindi"] as const;
export const RETREAT_DURATIONS = ["Weekend (2–3 days)", "Short (4–7 days)", "Week+ (8–14 days)", "Long (15+ days)"] as const;
export const PRODUCT_TYPES     = ["Mats & Props", "Apparel", "Books & Media", "Supplements", "Online Courses", "Accessories"] as const;
