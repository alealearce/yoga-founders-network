/**
 * tailwind.config.ts — Yoga Founders Network
 * Design System: "The Warm Register"
 * Colors must stay in sync with COLORS in lib/config/site.ts
 *
 * Rules of the system:
 * - Warm paper ground, warm ink text, one violet accent (line + text only).
 *   Violet matches the social carousels (app/api/social/image/route.tsx).
 * - Radius is 2px on everything; pills are reserved for the verification stamp
 *   and circular icons (rounded-full).
 * - No elevation: the shadow tokens render as 1px hairline rings so legacy
 *   `shadow-card` / `shadow-float` usage reads as bordered, not floating.
 */
import type { Config } from "tailwindcss";

// ── Brand Colors (Warm Register palette) ────────────────────────────────────
const BG                    = "#FAF6EF"  // Warm paper background
const SURFACE_LOW           = "#F3EDE0"  // Secondary sectioning
const SURFACE_LOWEST        = "#FFFDF8"  // Raised cards
const PRIMARY               = "#1F1F24"  // Dark grey — primary actions + dark panels
const PRIMARY_CONTAINER     = "#34343B"  // Hover state
const ON_PRIMARY            = "#FAF6EF"  // Text on primary
const SECONDARY_CONTAINER   = "#EAE1CF"  // Secondary buttons
const ON_SURFACE            = "#231E17"  // High-contrast text
const ON_SURFACE_VARIANT    = "#75695A"  // Secondary text
const OUTLINE_VARIANT       = "#E5DCCB"  // Hairlines
const SURFACE_HIGHEST       = "#F3EDE0"  // Input backgrounds
const ACCENT                = "#5B2BB8"  // Violet — lines & large text
const ACCENT_TEXT           = "#4A2299"  // Violet, darkened for small text
const ACCENT_ON_DARK        = "#C4ADF7"  // Lilac — accent text on ink panels

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:               BG,
        "surface-low":    SURFACE_LOW,
        "surface-card":   SURFACE_LOWEST,
        "surface-input":  SURFACE_HIGHEST,
        primary: {
          DEFAULT:   PRIMARY,
          container: PRIMARY_CONTAINER,
          on:        ON_PRIMARY,
        },
        // Accent reads from CSS variables (RGB triplets in globals.css) so the
        // whole site can be re-accented from one place. ACCENT / ACCENT_TEXT
        // above stay as the documented defaults.
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          text:    "rgb(var(--accent-text) / <alpha-value>)",
          dark:    ACCENT_ON_DARK,
        },
        "secondary-container": SECONDARY_CONTAINER,
        "on-surface":         ON_SURFACE,
        "on-surface-variant": ON_SURFACE_VARIANT,
        "outline-variant":    OUTLINE_VARIANT,
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans:  ["var(--font-sans)", "Manrope", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["4.5rem",  { lineHeight: "1.04", letterSpacing: "-0.015em" }],
        "display-md": ["3.25rem", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
        "display-sm": ["2.5rem",  { lineHeight: "1.12", letterSpacing: "-0.01em" }],
      },
      // Legacy rounded-xl/2xl/3xl usage across the app all collapses to the
      // system's 2px radius — sharp by token, no per-file sweep needed.
      borderRadius: {
        "xl":   "2px",
        "2xl":  "2px",
        "3xl":  "2px",
      },
      // Hairline rings, not elevation.
      boxShadow: {
        "float": `0 0 0 1px #CDBFA6`,
        "card":  `0 0 0 1px ${OUTLINE_VARIANT}`,
      },
      backdropBlur: {
        "glass": "16px",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
