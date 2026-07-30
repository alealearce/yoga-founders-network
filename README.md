# Yoga Founders Network

Directory of yoga studios, teachers, schools, retreats, products, and workshops.
LIVE at [yogafoundersnetwork.com](https://yogafoundersnetwork.com) — Vercel, auto-deploys from GitHub main.

**Status: PARKED** (2026-07-24) — no active development, but all automations keep running.

## Stack
Next.js 14 · Supabase (ref `dwqvxhktqvucsbcycprl`) · Resend (hello@yogafoundersnetwork.com) · Claude API · Blotato (social). No Stripe yet.

Shares the config-driven architecture of the other directory sites (infosylvita / peptide-alliance / pronearby): `lib/config/site.ts`, `lib/supabase/`, `lib/email/resend.ts`, `lib/ai/claude.ts`, `app/api/`, `app/[locale]/`.

## Design — binding
"The Warm Register": warm paper `#FAF6EF` / ink `#231E17` / turmeric `#A2620F` (lines + text only), Instrument Serif (single weight + italic, never font-bold) + Manrope, 2px radius everywhere, hairline borders instead of shadows. Full rules in the `tailwind.config.ts` header. Copy voice: "the network".

## Automations (Vercel crons, UTC)
- 16:00 daily — `daily-social?kind=showcase`: listing showcase carousel via Blotato → Instagram, X, Pinterest, LinkedIn
- 16:30 weekdays — `spotlight-invites` (finite invite pool)
- 18:07 daily — `daily-blog` (SEO post, root slugs)
- pending-check (20:00 + 02:00), expiry-check (14:00)

`GET /api/health` validates database/Resend/blog freshness **and social posting** (per-platform failure detection on `social_posts`); the daily 5am GAS runner emails on failure.

## SEO
Hub-first: canonical category URLs are `/yogastudio` style (not `/studios`) — always link to canonicals.

See the workspace [OPERATIONS.md](../OPERATIONS.md) for the portfolio-wide runbook.
