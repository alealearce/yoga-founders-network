# Founder Story Pipeline — Spec

**Status: BUILT 2026-07-12 — committed on main (b04476d), DB migration applied to remote, dry-run verified. Awaiting push to deploy. Amendments from approval: public-facing framing is "Welcome + Member Spotlight" (not "story"); form has an opt-out toggle that collapses the Your Story section and skips the pipeline.**

Every new teacher, studio, or business owner who joins the network gets their story
told: five questions and up to three photos collected at onboarding become a published
Journal post and a social carousel the moment their listing is approved. Zero extra
work for them, zero extra work for the admin. The published story is the recruitment
lever — "join the network and we tell your story to our audience."

---

## 1. The flow at a glance

**Founder's view:**
1. Fills the existing `/submit` form. A new "Your Story" section asks 5 short
   questions and accepts up to 3 photos of them / their space.
2. Gets the existing welcome email ("under review").
3. On approval, gets ONE email: "You're live — and so is your story," with links to
   their listing, their Journal story, and the social post, plus a nudge to reshare.

**Admin's view (you):**
1. Pending listing appears in `/admin` as today, now with the story answers and
   photos visible in the row detail.
2. Click Approve. Behind that one click: listing goes live, Claude writes the story
   post into the Journal, Blotato publishes the carousel to all configured platforms,
   the email goes out. If story generation fails, the approval still succeeds and a
   "Generate story" retry button appears on the row.

**Audience's view:**
- A new post at `/community/meet-{listing-slug}` in a new `founder_story` category.
- A 4-slide carousel on IG/FB/LinkedIn/X/Threads/Bluesky/Pinterest: portrait hero,
  pull-quote, "why they built it," CTA to read the full story.

---

## 2. The five questions

Shown under the heading **"Your Story"** with the pitch copy directly above the
fields (this copy is the lever — it sells the feature at the moment of signup):

> *Every founder who joins the network gets their story published in The Journal and
> featured across our channels. Answer in your own words — two or three sentences
> each is plenty. We'll shape it into your introduction.*

| # | Field key | Question (label) | Why it's asked |
|---|---|---|---|
| 1 | `origin` | What first brought you to yoga? | The hook — every story opens here |
| 2 | `leap` | What made you take the leap — teaching, opening your doors, or building this? | The founding moment; this is a founders network |
| 3 | `hard_truth` | What's the hardest part of this work that most people never see? | Vulnerability = the shareable pull-quote |
| 4 | `feeling` | What do you want people to feel when they leave your class, space, or experience? | Their promise, in their words |
| 5 | `advice` | What would you tell someone thinking about starting their own yoga journey or business? | CTA energy; recruits the next founder |

- **Opt-out toggle (top of the section):** "Prefer not to be featured? If you'd
  rather we simply list your business — no welcome post, no spotlight — check this
  box and we won't." Checking it collapses the entire Your Story section (questions
  + photos hidden, values kept but ignored) and sets `story_opt_out = true`, which
  hard-skips the pipeline regardless of what was answered.
- All 5 are optional individually, but the story pipeline only runs if **at least 3
  are answered** and **at least 1 story photo** is uploaded. Below that threshold,
  approval behaves exactly as today (no story post, no story social).
- Each answer: textarea, soft limit ~600 chars with a counter (long enough for
   3–4 sentences, short enough to force voice over essay).
- Question text lives in a config constant (`FOUNDER_QUESTIONS` in
  `lib/config/site.ts`) so wording can be tuned without touching form or prompt code.

**Photos (amended 2026-07-12):** the form has ONE photos section — the listing's
existing 6-photo uploader. The spotlight draws from it via `storyPhotos()` in
`lib/social/eligibility.ts`: dedicated `founder_images` when present (legacy
submissions keep working), otherwise `listing.images`. First photo = blog cover +
social hero slide. The Your Story section just notes that the Photos section below
feeds the feature.

---

## 3. Data model

New migration `supabase/migrations/*_founder_story.sql`:

```sql
alter table listings add column founder_story jsonb;      -- {origin, leap, hard_truth, feeling, advice}
alter table listings add column founder_images text[] default '{}';
alter table listings add column story_opt_out boolean not null default false;
alter table listings add column story_post_id uuid references blog_posts(id);  -- set once published; doubles as the idempotency check

-- allow the new social kind
alter table social_posts drop constraint social_posts_kind_check;
alter table social_posts add constraint social_posts_kind_check
  check (kind in ('blog','showcase','story'));
```

Mirror in `lib/supabase/types.ts` (`Listing` interface) and `BlogPost` needs no
change — the story post is a normal `blog_posts` row with `category:
'founder_story'`, `generated_by: 'claude-founder-story'`.

---

## 4. Changes by file

### 4.1 Form — `app/[locale]/submit/page.tsx`
- New "Your Story" section (after "Tell Us About Your Practice"): pitch copy, 5
  labeled textareas with char counters, 3-photo uploader (mirror of the existing
  6-photo one, separate state key `founder_images`).
- Add `founder_story` + `founder_images` to `INITIAL` and to the submit payload.
- Warm Register rules apply: Instrument Serif headings, hairline borders, 2px
  radius, turmeric for lines/text only, no emojis, lucide icons only.

### 4.2 Submit API — `app/api/business/submit/route.ts`
- Extend `SubmitSchema`: `founder_story` (object of 5 optional strings, each
  max ~1000), `founder_images` (array max 3, same `isOwnStorageUrl` filter as
  `images`).
- Include both in the `listings` insert.

### 4.3 Approval trigger — `app/api/admin/action/route.ts`
In `case 'approve'`, after the status update and `sendApprovalEmail` logic:

1. **Eligibility check:** `story_opt_out` is false AND `founder_story` has ≥3
   non-empty answers AND `founder_images` has ≥1 image AND `story_post_id` is null
   (idempotency — re-approving never double-posts).
2. **Generate** the Journal post (see 4.4) and insert into `blog_posts`
   (`is_published: true`); write the returned id to `listings.story_post_id`.
3. **Publish** the social carousel (see 4.5); audit rows go to `social_posts`
   with `kind: 'story'`, `ref_id` = listing id.
4. **Email:** replace `sendApprovalEmail` with `sendApprovalEmail(..., storyUrl?)`
   — one email that covers both listing-live and story-live, with a "share your
   story" line and the direct Journal link. (One email, not two — they fire at the
   same moment.)
5. Bump the route's `maxDuration` to 300. Every call **awaited** (Vercel kills
   fire-and-forget). The approve click will take ~30–60s — acceptable for an admin
   button; show a spinner state in `AdminClient.tsx`.
6. **Failure isolation:** wrap steps 2–4 in try/catch. Generation failure must
   never fail the approval — the listing still goes live, the response returns
   `{ ok: true, storyStatus: 'failed' }`, and the admin row shows a
   **"Generate story"** retry button wired to a new action `story` in
   `VALID_ACTIONS` that re-runs steps 1–4 standalone. (This retry action is also
   the manual path for any listing where you want to run the story later.)

### 4.4 Blog generation — new `lib/social/story.ts` (or inline in the action route)
Reuse the `daily-blog` pattern exactly: `@anthropic-ai/sdk`, forced tool-use for
structured output, but a dedicated prompt:

- **Input:** listing name, type, city/country, description, the 5 Q&As verbatim,
  image URLs.
- **Voice rules in the system prompt:** "the network" copy voice; first person
  quotes preserved verbatim (never paraphrase inside quote marks); no emojis; no
  invented biographical facts — if a question is unanswered, skip that beat, never
  fill it in.
- **Public framing is "Welcome + Member Spotlight," never "story":** `title`
  follows a "Welcome to the Network: {Name}" / "Member Spotlight: {Name}" pattern;
  the post opens by welcoming them to the network and spotlights them from there.
- **Output (tool schema):** `title` (welcome/spotlight pattern above),
  `excerpt`, `meta_title`, `meta_description`, `content` (markdown ~500–700 words:
  welcome intro → woven Q&A with the answers quoted → closing with listing link),
  `pull_quote` (one line lifted verbatim from an answer — feeds the social slide).
- Markdown embeds the 2nd/3rd founder images between sections
  (`![...]({url})` — the community `[slug]` renderer already handles images;
  verify, else extend `markdownToHtml`).
- Row: `slug: welcome-{listing.slug}`, `cover_image: founder_images[0]`,
  `category: 'founder_story'` (internal key; public label "Member Spotlight"),
  `city`, `tags: [type, city]`, `author: 'Yoga Founders Network'`.
- Add `founder_story` to the community page's category labels/`CATEGORY_TO_LISTING`
  map so the category chip renders as "Member Spotlight" and cross-links to the
  listing type.

### 4.5 Social carousel
Reuse the full `daily-social` stack:

- **Slides** — extend `app/api/social/image/route.tsx` with `type=story`,
  4 slides at 1080×1350, "MEMBER SPOTLIGHT" eyebrow throughout: (0) hero — founder
  photo full-bleed, "Welcome to the network" + name + type + city lockup; (1)
  pull-quote on cream; (2) "why they built it" — 2-line blurb from the `leap`
  answer; (3) CTA — "Read {first name}'s spotlight" + short URL + flower mark.
  Same brand system as existing blog/showcase slides. Captions welcome them by
  name ("Please welcome {name} to the network").
- **Caption** — new `buildStoryCaption(listing, storyUrl, pullQuote)` in
  `lib/social/caption.ts` (Haiku + deterministic fallback, ≤5 hashtags, per-platform
  clamp via existing `clampCaption`).
- **Publish** — `uploadAll` the 4 rendered slide URLs, then `publish()` per
  configured platform; Threads gets slide 0 only (existing `SINGLE_IMAGE_ONLY`).
  Immediate post, matching current behavior. Audit each platform to `social_posts`
  (`kind: 'story'`).
- **Collision note:** stories post at approval time, whenever that is; the daily
  showcase cron (16:00 UTC) keys off `last_featured_at` and is untouched. A member
  can get a story post on day 1 and a showcase later — that's fine, different
  formats. Do NOT set `last_featured_at` from the story publish.

### 4.6 Admin UI — `app/[locale]/admin/AdminClient.tsx`
- Pending row detail: show the 5 answers + story photo thumbnails so you're
  reviewing the story content as part of approving the listing (this is the
  moderation step — nothing publishes that you haven't seen).
- Story status chip per row: `none` / `published` (links to post) / `failed`
  (shows the retry button).

### 4.7 Marketing the lever
- `/submit` page: pitch copy above the story section (§2).
- Homepage + "The Journal" section copy (`lib/config/site.ts` `COPY`): one line —
  "Every founder who joins gets their story told." This is the outreach hook; it
  should also go verbatim into any recruitment DMs/emails you send manually.

---

## 5. Edge cases and risks

- **Story below threshold** (<3 answers or 0 photos): silently skip the pipeline;
  approval works exactly as today. No nagging email — the incentive copy on the
  form is the nudge.
- **Duplicate publishing:** guarded by `story_post_id` (blog) and the `social_posts`
  ref check (social) — same idempotency pattern as `daily-social`.
- **Claude output quality:** forced tool-use gives structure; keep content as
  markdown fields (small, safe for JSON — the @@FIELD@@ delimiter lesson applies
  only to large HTML, which we avoid by staying in markdown).
- **Photo quality/appropriateness:** admin sees all photos pre-approval; that's the
  gate. No auto-moderation in v1.
- **Blotato partially configured:** `configuredPlatforms()` already handles missing
  account IDs — publishes to what's configured, logs the rest.
- **Approve latency:** 30–60s with the AI call inline. If it annoys, v2 can
  pre-generate the draft at submission time and make approve instant — not worth
  the extra state machine in v1.
- **Live-money risk:** none — yoga has no Stripe. Outbound risk is the social post
  and the email, both gated behind the explicit admin Approve click, which is the
  confirmation step.

## 6. Out of scope (v2 candidates)

- Backfill campaign: invite existing approved members to submit their story via a
  magic link (needs an authed edit form — meaningful extra surface).
- Video stories / reels.
- Scheduling the social post for peak hours instead of posting at approval time
  (Blotato supports `scheduledTime`; see the peptide custom-scheduling pattern).
- Auto-DM/notify the founder on the platforms where they were tagged.

## 6c. Phase 3 — Draft-then-publish + cross-links (LIVE 2026-07-17)

After the first real submission (Susan Horning) exposed four gaps, the flow is
now draft-first: 'story'/'approve' generate an UNPUBLISHED draft;
`/admin/spotlight/{listingId}` previews the post + hero slide; "Publish &
Share" (`story_publish`) flips it live, fires the carousel, and emails the
member; `story_regenerate` discards an unpublished draft. Admin has a Stories
tab (`/admin?tab=stories`) with readable Q&A everywhere. Cross-links: listing
profile ↔ spotlight post (derived from `story_post_id`, published only).
Hero-image fix: slide renderer proxies photos server-side forcing JPEG (Satori
can't decode WebP — the black-hero incident) with a branded flower-mark
fallback; `usablePhotos()` validates URLs at generation; get-featured uploads
are PREPENDED so the founder's own photo leads. `blog_posts.pull_quote` persists
the quote for the later share. `reshareSpotlightCarousel()` exists for
correcting a bad share (bypasses the already-shared guard).

## 6b. Phase 2 — Get Featured engine (LIVE 2026-07-16; invites cron armed weekdays 16:30 UTC)

Converts the seeded directory (621 approved unclaimed listings, 613 with emails,
0 with stories as of 2026-07-16) into spotlighted members:

- **Magic-link form** `/get-featured?token={listings.invite_token}` — the 5
  questions + photo upload (appends to `listing.images`, cap 6, 71% of seeds have
  no photos); prefills existing answers; submits via `/api/get-featured`; admin
  gets a "story submitted" email and the existing "Generate spotlight" button
  publishes it.
- **Invite email** `sendSpotlightInviteEmail` — "you're already listed, get your
  Member Spotlight" with personal link, optional example-spotlight link, and a
  one-click unsubscribe (`/api/outreach/unsubscribe?token=` →
  `listings.outreach_opt_out`). CASL posture: published business address +
  message about their own listing = implied consent; unsubscribe + suppression
  honored forever.
- **Send engine (DISARMED)** `/api/admin/spotlight-invites` — CRON_SECRET auth,
  dry-run by default, `live=1` to send, limit default 25 (hard cap 50), logs to
  `outreach_log`, excludes already-invited/opted-out/storied listings. NOT in
  vercel.json — fired manually until the user arms it.
- Migration `20260716100000_get_featured_outreach.sql`: `invite_token` (unique)
  + `outreach_opt_out` on listings; `outreach_log` table.

Later phases (not built): IG caption tagging of member handles, weekly "Get
Featured" recruitment carousel, discovery scraper feeding new seeds.

## 7. Build order

1. Migration + types + form section + submit API (story data flowing in, visible in admin). 
2. Blog generation + community category wiring (story publishes on approve).
3. Slide renderer `type=story` + caption builder + Blotato publish + `social_posts` kind.
4. Approval email update + admin retry action + status chips.
5. Marketing copy on /submit and homepage.

Each step ships independently; the pipeline only activates end-to-end at step 3.
Verify per the manual: submit a real test listing with story answers, approve it in
`/admin`, confirm the Journal post renders, the carousel hits at least one platform
(`?dry=1` first), and the email arrives.
