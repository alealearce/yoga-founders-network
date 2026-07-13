/**
 * GET /api/social/image — renders one 1080×1350 (4:5) branded social slide for
 * Yoga Founders Network. PUBLIC (no auth): Blotato fetches these URLs to ingest
 * the carousel images.
 *
 * Two post types, each a multi-slide carousel:
 *
 *   ?type=blog&slide=0..2
 *     0  hook   — serif title on cream (the editorial template)
 *     1  tldr   — "the 3-minute version", 3 numbered points
 *     2  cta    — read on The Journal + link
 *     params: title, points (a|b|c), category, url
 *
 *   ?type=showcase&slide=0..3
 *     0  hero   — listing photo, "FEATURED TEACHER" pill, name, city
 *     1  why    — what makes them stand out (bold-sans + purple template)
 *     2  detail — style / location facts
 *     3  cta    — discover on YFN + @handle
 *     params: name, kind, city, country, img, blurb, style, handle
 *
 *   ?type=story&slide=0..3   (Founder Story — "Welcome + Member Spotlight")
 *     0  hero   — founder photo full-bleed, "Welcome to the network" + name + type/city
 *     1  quote  — pull-quote, large serif italic on cream
 *     2  blurb  — "why they built it" (from the leap answer)
 *     3  cta    — "Read {first name}'s spotlight" + short URL
 *     params: img, name, kind, city, quote, blurb, url
 *
 * Fully param-driven so previews and the founder-story pipeline share one renderer.
 * Design language mirrors the existing @yogafoundersnetwork grid: warm cream +
 * ink, Flower-of-Life mark, Noto Serif headlines, Manrope for the bold templates,
 * a single purple→indigo gradient accent on the showcase slides.
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Real YFN Flower-of-Life mark, pre-rendered to transparent black + white PNGs
// (public/social/). Embedded as data URIs so the renderer needs no network.
function dataUri(file: string): string {
  const buf = readFileSync(join(process.cwd(), 'public', 'social', file));
  return `data:image/png;base64,${buf.toString('base64')}`;
}
let MARKS: { black: string; white: string } | null = null;
function marks() {
  if (!MARKS) MARKS = { black: dataUri('flower-black.png'), white: dataUri('flower-white.png') };
  return MARKS;
}

// ── Brand tokens (sampled from the existing IG grid) ─────────────────────────
const CREAM = '#f2ede3';
const CREAM_DEEP = '#ebe5d8';
const GRID = '#f4f3f0';
const INK = '#14110d';
const INK_SOFT = '#4a463e';
const PURPLE_A = '#7b2ff7';
const PURPLE_B = '#2d1b69';
const W = 1080;
const H = 1350;

// ── Fonts (fetched once from jsDelivr/fontsource, cached in module scope) ─────
const FONT_FILES = {
  serif:     'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.18/files/noto-serif-latin-500-normal.woff',
  serifBold: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.18/files/noto-serif-latin-700-normal.woff',
  sans:      'https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.0.18/files/manrope-latin-500-normal.woff',
  sansBold:  'https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.0.18/files/manrope-latin-700-normal.woff',
  sansBlack: 'https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.0.18/files/manrope-latin-800-normal.woff',
} as const;

let fontCache: { name: string; data: ArrayBuffer; weight: 400 | 500 | 700 | 800; style: 'normal' }[] | null = null;

async function loadFonts() {
  if (fontCache) return fontCache;
  const [serif, serifBold, sans, sansBold, sansBlack] = await Promise.all(
    Object.values(FONT_FILES).map((u) => fetch(u).then((r) => r.arrayBuffer()))
  );
  fontCache = [
    { name: 'Noto Serif', data: serif, weight: 500, style: 'normal' },
    { name: 'Noto Serif', data: serifBold, weight: 700, style: 'normal' },
    { name: 'Manrope', data: sans, weight: 500, style: 'normal' },
    { name: 'Manrope', data: sansBold, weight: 700, style: 'normal' },
    { name: 'Manrope', data: sansBlack, weight: 800, style: 'normal' },
  ];
  return fontCache;
}

// ── Flower of Life mark (the YFN logo glyph) ─────────────────────────────────
// `color` only selects the dark/light variant of the real mark.
function FlowerOfLife({ size, color = INK }: { size: number; color?: string; sw?: number }) {
  const light = color === '#ffffff' || color === 'white' || color === '#fff';
  const src = light ? marks().white : marks().black;
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src={src} alt="" width={size} height={size} style={{ display: 'flex', objectFit: 'contain' }} />;
}

function SendIcon({ size = 24, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ display: 'flex' }}>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function BookmarkIcon({ size = 24, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ display: 'flex' }}>
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-5-7 5V4a1 1 0 0 1 1-1Z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Logo lockup: glyph + stacked wordmark, top-center, on every slide.
function Logo({ color = INK, compact = false }: { color?: string; compact?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
      <FlowerOfLife size={compact ? 60 : 76} color={color} sw={compact ? 2 : 2.5} />
      <div style={{ display: 'flex', flexDirection: 'column', color, fontFamily: 'Manrope', fontWeight: 500, fontSize: compact ? '21px' : '25px', lineHeight: 1.12, letterSpacing: '3px' }}>
        <div style={{ display: 'flex' }}>YOGA</div>
        <div style={{ display: 'flex' }}>FOUNDERS</div>
        <div style={{ display: 'flex' }}>NETWORK</div>
      </div>
    </div>
  );
}

function ShareSave({ color = INK_SOFT }: { color?: string }) {
  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', color, fontFamily: 'Manrope', fontWeight: 600, fontSize: '22px', letterSpacing: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><SendIcon color={color} /> SHARE</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>SAVE <BookmarkIcon color={color} /></div>
    </div>
  );
}

function SwipeChip({ label = 'SWIPE', color = INK }: { label?: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color, fontFamily: 'Manrope', fontWeight: 700, fontSize: '22px', letterSpacing: '2px' }}>
      {label} <span style={{ display: 'flex' }}>→</span>
    </div>
  );
}

function fit(text: string, big: number, mid: number, small: number): number {
  if (text.length > 78) return small;
  if (text.length > 44) return mid;
  return big;
}

// ════════════════════════ BLOG DIGEST (serif / cream) ════════════════════════

function BlogHook({ title, category }: { title: string; category: string }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', background: CREAM, padding: '76px 78px' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}><Logo /></div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 700, fontSize: '24px', letterSpacing: '4px', color: INK_SOFT, marginBottom: '26px' }}>
          THE JOURNAL · {category.toUpperCase()}
        </div>
        <div style={{ display: 'flex', fontFamily: 'Noto Serif', fontWeight: 700, fontSize: `${fit(title, 84, 70, 56)}px`, lineHeight: 1.12, color: INK, letterSpacing: '-1px' }}>
          {title}
        </div>
        <div style={{ display: 'flex', width: '300px', height: '3px', background: INK, marginTop: '40px' }} />
        <div style={{ display: 'flex', fontFamily: 'Noto Serif', fontWeight: 500, fontStyle: 'italic', fontSize: '34px', color: INK_SOFT, marginTop: '26px' }}>
          The 3-minute version →
        </div>
      </div>
      <ShareSave />
    </div>
  );
}

function BlogTldr({ points }: { points: string[] }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', background: CREAM_DEEP, padding: '76px 78px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Logo compact />
        <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 700, fontSize: '24px', letterSpacing: '3px', color: INK_SOFT }}>TL;DR</div>
      </div>
      <div style={{ display: 'flex', fontFamily: 'Noto Serif', fontWeight: 700, fontSize: '50px', color: INK, marginTop: '40px', marginBottom: '14px' }}>
        The 3-minute version
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: '38px' }}>
        {points.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '28px' }}>
            <div style={{ display: 'flex', fontFamily: 'Noto Serif', fontWeight: 700, fontSize: '64px', lineHeight: 1, color: INK, width: '70px' }}>{i + 1}</div>
            <div style={{ display: 'flex', flex: 1, fontFamily: 'Manrope', fontWeight: 500, fontSize: '36px', lineHeight: 1.34, color: INK }}>{p}</div>
          </div>
        ))}
      </div>
      <ShareSave />
    </div>
  );
}

function BlogCta({ title, url }: { title: string; url: string }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: CREAM, padding: '78px' }}>
      <FlowerOfLife size={150} color={INK} sw={2.5} />
      <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 700, fontSize: '24px', letterSpacing: '4px', color: INK_SOFT, marginTop: '54px' }}>
        KEEP READING
      </div>
      <div style={{ display: 'flex', textAlign: 'center', fontFamily: 'Noto Serif', fontWeight: 700, fontSize: '52px', lineHeight: 1.18, color: INK, marginTop: '22px', maxWidth: '820px' }}>
        Read the full piece on The Journal
      </div>
      <div style={{ display: 'flex', textAlign: 'center', fontFamily: 'Manrope', fontWeight: 500, fontSize: '30px', color: INK_SOFT, marginTop: '30px', maxWidth: '780px' }}>
        “{title}”
      </div>
      <div style={{ display: 'flex', alignItems: 'center', background: INK, color: CREAM, fontFamily: 'Manrope', fontWeight: 700, fontSize: '28px', padding: '22px 44px', borderRadius: '999px', marginTop: '48px' }}>
        {url}
      </div>
    </div>
  );
}

// ════════════════════════ SHOWCASE (bold-sans / purple) ══════════════════════

function PurplePill({ label, fontSize = 34 }: { label: string; fontSize?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: `linear-gradient(100deg, ${PURPLE_A}, ${PURPLE_B})`, color: '#ffffff', fontFamily: 'Manrope', fontWeight: 800, fontSize: `${fontSize}px`, letterSpacing: '1px', padding: '14px 30px', borderRadius: '16px', textTransform: 'uppercase' }}>
      {label}
    </div>
  );
}

function DottedBg() {
  // subtle dot-grid matching the existing showcase template
  const dots = [];
  for (let y = 60; y < H; y += 56) {
    for (let x = 60; x < W; x += 56) {
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill="#d9d6cf" />);
    }
  }
  return (
    <svg width={W} height={H} style={{ display: 'flex', position: 'absolute', top: 0, left: 0 }} xmlns="http://www.w3.org/2000/svg">{dots}</svg>
  );
}

function ShowcaseHero({ name, kind, city, country, img }: { name: string; kind: string; city: string; country: string; img: string }) {
  const loc = [city, country].filter(Boolean).join(', ');
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', position: 'relative', background: INK }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" width={W} height={H} style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, objectFit: 'cover' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, display: 'flex', background: 'linear-gradient(180deg, rgba(10,8,16,0.55) 0%, rgba(10,8,16,0.05) 38%, rgba(10,8,16,0.35) 66%, rgba(10,8,16,0.92) 100%)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '70px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Logo color="#ffffff" /></div>
        <div style={{ display: 'flex', flex: 1 }} />
        <div style={{ display: 'flex' }}><PurplePill label={`Featured ${kind}`} /></div>
        <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 800, fontSize: `${fit(name, 96, 78, 60)}px`, lineHeight: 1.04, color: '#ffffff', marginTop: '24px', letterSpacing: '-1px' }}>
          {name}
        </div>
        {loc ? (
          <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 500, fontSize: '34px', color: 'rgba(255,255,255,0.86)', marginTop: '18px' }}>📍 {loc}</div>
        ) : null}
        <div style={{ display: 'flex', marginTop: '34px' }}><SwipeChip color="#ffffff" /></div>
      </div>
    </div>
  );
}

function ShowcaseBody({ index, total, eyebrow, heading, body }: { index: number; total: number; eyebrow: string; heading: string; body: string }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', position: 'relative', background: GRID, padding: '70px' }}>
      <DottedBg />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <Logo compact />
        <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 700, fontSize: '28px', color: INK_SOFT }}>{index}/{total}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '64px', position: 'relative' }}>
        <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 800, fontSize: '92px', lineHeight: 1, color: INK }}>{String(index).padStart(2, '0')}</div>
        <PurplePill label={eyebrow} fontSize={38} />
      </div>
      <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 800, fontSize: '54px', lineHeight: 1.1, color: INK, marginTop: '40px', position: 'relative', maxWidth: '900px' }}>
        {heading}
      </div>
      <div style={{ display: 'flex', flex: 1, fontFamily: 'Manrope', fontWeight: 500, fontSize: '38px', lineHeight: 1.42, color: INK_SOFT, marginTop: '30px', position: 'relative' }}>
        {body}
      </div>
      <div style={{ position: 'relative', display: 'flex', width: '100%' }}><ShareSave /></div>
    </div>
  );
}

function ShowcaseCta({ name, handle }: { name: string; handle: string }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(150deg, ${PURPLE_B} 0%, #1a1030 100%)`, padding: '78px' }}>
      <FlowerOfLife size={140} color="#ffffff" sw={2.5} />
      <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 700, fontSize: '24px', letterSpacing: '4px', color: 'rgba(255,255,255,0.7)', marginTop: '50px' }}>
        ✨ FEATURED TODAY
      </div>
      <div style={{ display: 'flex', textAlign: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: '60px', lineHeight: 1.1, color: '#ffffff', marginTop: '20px', maxWidth: '860px' }}>
        Discover {name} on Yoga Founders Network
      </div>
      <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 500, fontSize: '32px', color: 'rgba(255,255,255,0.82)', marginTop: '34px', textAlign: 'center', maxWidth: '760px' }}>
        The global home for yoga studios, teachers, schools & retreats.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', color: PURPLE_B, fontFamily: 'Manrope', fontWeight: 800, fontSize: '30px', padding: '22px 46px', borderRadius: '999px', marginTop: '50px' }}>
        yogafoundersnetwork.com
      </div>
      {handle ? (
        <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 500, fontSize: '26px', color: 'rgba(255,255,255,0.7)', marginTop: '26px' }}>in collaboration with {handle}</div>
      ) : null}
    </div>
  );
}

// ══════════════════════ FOUNDER STORY (cream+ink, spotlight) ═════════════════

function SpotlightPill({ color = INK, textColor = CREAM }: { color?: string; textColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: color, color: textColor, fontFamily: 'Manrope', fontWeight: 800, fontSize: '26px', letterSpacing: '3px', padding: '12px 26px', borderRadius: '999px', textTransform: 'uppercase' }}>
      Member Spotlight
    </div>
  );
}

function StoryHero({ img, name, kind, city }: { img: string; name: string; kind: string; city: string }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', position: 'relative', background: INK }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" width={W} height={H} style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, objectFit: 'cover' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, display: 'flex', background: 'linear-gradient(180deg, rgba(20,17,13,0.6) 0%, rgba(20,17,13,0.1) 38%, rgba(20,17,13,0.4) 66%, rgba(20,17,13,0.94) 100%)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '70px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Logo color="#ffffff" /></div>
        <div style={{ display: 'flex', flex: 1 }} />
        <div style={{ display: 'flex' }}><SpotlightPill color="#ffffff" textColor={INK} /></div>
        <div style={{ display: 'flex', fontFamily: 'Noto Serif', fontWeight: 500, fontStyle: 'italic', fontSize: '32px', color: 'rgba(255,255,255,0.85)', marginTop: '30px' }}>
          Welcome to the network
        </div>
        <div style={{ display: 'flex', fontFamily: 'Noto Serif', fontWeight: 700, fontSize: `${fit(name, 88, 72, 58)}px`, lineHeight: 1.06, color: '#ffffff', marginTop: '14px', letterSpacing: '-1px' }}>
          {name}
        </div>
        {kind || city ? (
          <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 500, fontSize: '32px', color: 'rgba(255,255,255,0.82)', marginTop: '20px' }}>
            {[kind, city].filter(Boolean).join(' · ')}
          </div>
        ) : null}
        <div style={{ display: 'flex', marginTop: '34px' }}><SwipeChip color="#ffffff" /></div>
      </div>
    </div>
  );
}

function StoryQuote({ quote }: { quote: string }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', background: CREAM, padding: '76px 78px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Logo compact />
        <SpotlightPill />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'Noto Serif', fontWeight: 700, fontSize: '104px', lineHeight: 1, color: INK, opacity: 0.22 }}>&ldquo;</div>
        <div style={{ display: 'flex', fontFamily: 'Noto Serif', fontWeight: 500, fontStyle: 'italic', fontSize: `${fit(quote, 60, 48, 40)}px`, lineHeight: 1.3, color: INK, marginTop: '6px' }}>
          {quote}
        </div>
      </div>
      <ShareSave />
    </div>
  );
}

function StoryBlurb({ blurb }: { blurb: string }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', background: CREAM_DEEP, padding: '76px 78px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Logo compact />
        <SpotlightPill />
      </div>
      <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 700, fontSize: '24px', letterSpacing: '3px', color: INK_SOFT, marginTop: '54px' }}>
        WHY THEY BUILT IT
      </div>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', fontFamily: 'Noto Serif', fontWeight: 700, fontSize: `${fit(blurb, 52, 42, 34)}px`, lineHeight: 1.32, color: INK }}>
        {blurb}
      </div>
      <ShareSave />
    </div>
  );
}

function StoryCta({ name, url }: { name: string; url: string }) {
  const first = name.trim().split(/\s+/)[0] || name;
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: INK, padding: '78px' }}>
      <FlowerOfLife size={150} color="#ffffff" sw={2.5} />
      <div style={{ display: 'flex', marginTop: '48px' }}><SpotlightPill color="#ffffff" textColor={INK} /></div>
      <div style={{ display: 'flex', textAlign: 'center', fontFamily: 'Noto Serif', fontWeight: 700, fontSize: '54px', lineHeight: 1.16, color: '#ffffff', marginTop: '30px', maxWidth: '820px' }}>
        Read {first}&apos;s spotlight
      </div>
      <div style={{ display: 'flex', textAlign: 'center', fontFamily: 'Manrope', fontWeight: 500, fontSize: '30px', color: 'rgba(255,255,255,0.78)', marginTop: '24px', maxWidth: '760px' }}>
        The global home for yoga studios, teachers, schools &amp; retreats.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', background: CREAM, color: INK, fontFamily: 'Manrope', fontWeight: 700, fontSize: '28px', padding: '22px 44px', borderRadius: '999px', marginTop: '48px' }}>
        {url}
      </div>
    </div>
  );
}

// ───────────────────────────── handler ──────────────────────────────────────

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const type = q.get('type') || 'blog';
  const slide = Number(q.get('slide') ?? 0);
  const fonts = await loadFonts();
  const opts = { width: W, height: H, fonts, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } } as const;

  if (type === 'showcase') {
    const name = q.get('name') || 'Featured Listing';
    const kind = q.get('kind') || 'Studio';
    const city = q.get('city') || '';
    const country = q.get('country') || '';
    const img = q.get('img') || 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1080&h=1350&fit=crop&q=80';
    const blurb = q.get('blurb') || '';
    const style = q.get('style') || '';
    const handle = q.get('handle') || '';

    let node: JSX.Element;
    if (slide === 0) node = <ShowcaseHero name={name} kind={kind} city={city} country={country} img={img} />;
    else if (slide === 1) node = <ShowcaseBody index={2} total={4} eyebrow="Why they stand out" heading={`Meet ${name}`} body={blurb} />;
    else if (slide === 2) node = <ShowcaseBody index={3} total={4} eyebrow="The practice" heading={style ? `${style} — and more` : 'A practice worth finding'} body={[style && `Style: ${style}`, [city, country].filter(Boolean).join(', ') && `Based in ${[city, country].filter(Boolean).join(', ')}`, 'Verified on Yoga Founders Network.'].filter(Boolean).join('  ·  ')} />;
    else node = <ShowcaseCta name={name} handle={handle} />;
    return new ImageResponse(node, opts);
  }

  if (type === 'story') {
    const name = q.get('name') || 'A New Member';
    const kind = q.get('kind') || '';
    const city = q.get('city') || '';
    const img = q.get('img') || 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1080&h=1350&fit=crop&q=80';
    const quote = q.get('quote') || `Welcome ${name} to the network.`;
    const blurb = q.get('blurb') || 'A new founder joins Yoga Founders Network.';
    const url = q.get('url') || 'yogafoundersnetwork.com/community';

    let node: JSX.Element;
    if (slide === 0) node = <StoryHero img={img} name={name} kind={kind} city={city} />;
    else if (slide === 1) node = <StoryQuote quote={quote} />;
    else if (slide === 2) node = <StoryBlurb blurb={blurb} />;
    else node = <StoryCta name={name} url={url} />;
    return new ImageResponse(node, opts);
  }

  // type === 'blog'
  const title = q.get('title') || 'A fresh perspective from The Journal';
  const category = q.get('category') || 'finding yoga';
  const url = q.get('url') || 'yogafoundersnetwork.com/community';
  const points = (q.get('points') || 'First key takeaway from the post.|Second insight worth saving.|Third practical tip you can use today.')
    .split('|').map((s) => s.trim()).filter(Boolean).slice(0, 3);

  let node: JSX.Element;
  if (slide === 0) node = <BlogHook title={title} category={category} />;
  else if (slide === 1) node = <BlogTldr points={points} />;
  else node = <BlogCta title={title} url={url} />;
  return new ImageResponse(node, opts);
}
