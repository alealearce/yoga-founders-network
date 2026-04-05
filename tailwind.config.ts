/**
 * tailwind.config.ts — Yoga Founders Network
 * Design System: "The Digital Atrium"
 * Colors must stay in sync with COLORS in lib/config/site.ts
 */
import type { Config } from "tailwindcss";

// ── Brand Colors (The Digital Atrium palette) ───────────────────────────────
const BG                    = "#fafaf5"  // Warm organic background
const SURFACE_LOW           = "#f4f4ef"  // Secondary sectioning
const SURFACE_LOWEST        = "#ffffff"  // Interactive cards
const PRIMARY               = "#536046"  // Sage green — primary actions
const PRIMARY_CONTAINER     = "#6b795d"  // Gradient end / hover
const ON_PRIMARY            = "#ffffff"  // Text on primary
const SECONDARY_CONTAINER   = "#dde5d4"  // Secondary buttons
const ON_SURFACE            = "#1a1c19"  // High-contrast text (never pure black)
const ON_SURFACE_VARIANT    = "#43483e"  // Secondary text
const OUTLINE_VARIANT       = "#c5c8bd"  // Ghost borders (at low opacity)
const SURFACE_HIGHEST       = "#e2e3dc"  // Input backgrounds

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
        "secondary-container": SECONDARY_CONTAINER,
        "on-surface":         ON_SURFACE,
        "on-surface-variant": ON_SURFACE_VARIANT,
        "outline-variant":    OUTLINE_VARIANT,
      },
      fontFamily: {
        serif: ["Noto Serif", "Georgia", "serif"],
        sans:  ["Manrope", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.75rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-sm": ["2rem",   { lineHeight: "1.2",  letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        "xl":   "1rem",
        "2xl":  "1.5rem",
        "3xl":  "2rem",
        "full": "9999px",
      },
      boxShadow: {
        "float": "0 0 40px 0 rgba(26, 28, 25, 0.04)",
        "card":  "0 2px 20px 0 rgba(26, 28, 25, 0.06)",
      },
      backdropBlur: {
        "glass": "16px",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
