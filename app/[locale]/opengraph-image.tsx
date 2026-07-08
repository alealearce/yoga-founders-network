import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config/site";

// Default og:image for every route under [locale] that doesn't provide its
// own image (listing pages with photos keep their photo).
// NOTE: must live in [locale], not the app root — the [locale] layout's
// config-based openGraph would override a root-level file-convention image.
// Design: "The Digital Atrium" — warm paper, sage accents, serif wordmark.

export const runtime = "edge";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Digital Atrium palette
const PAPER = "#fafaf5";
const SAGE = "#536046";
const INK = "#22281e";
const MUTED = "#6b7261";

const KICKER = "THE GLOBAL YOGA DIRECTORY";
const FOOTER = SITE.domain;

/**
 * Load a Google Font subset (TTF) for satori. Returns null on any failure so
 * the image still renders with the bundled default font instead of erroring.
 */
async function loadGoogleFont(
  family: string,
  weight: number,
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family
    )}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const match = css.match(
      /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/
    );
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const allText = `${SITE.name}${SITE.tagline}${KICKER}${FOOTER}`;

  const [serif, sans] = await Promise.all([
    loadGoogleFont("Noto Serif", 700, allText),
    loadGoogleFont("Manrope", 500, allText),
  ]);

  const fonts = [
    ...(serif ? [{ name: "Noto Serif", data: serif, weight: 700 as const }] : []),
    ...(sans ? [{ name: "Manrope", data: sans, weight: 500 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: PAPER,
          padding: "64px 80px",
          fontFamily: sans ? "Manrope" : "sans-serif",
        }}
      >
        {/* Sage top rule */}
        <div
          style={{
            display: "flex",
            width: 72,
            height: 6,
            backgroundColor: SAGE,
            borderRadius: 3,
            marginBottom: 48,
          }}
        />

        {/* Kicker */}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            color: SAGE,
            marginBottom: 28,
          }}
        >
          {KICKER}
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: serif ? "Noto Serif" : "serif",
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 1.08,
            color: INK,
          }}
        >
          <span>Yoga Founders</span>
          <span style={{ color: SAGE }}>Network</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: MUTED,
            marginTop: 32,
          }}
        >
          {SITE.tagline}
        </div>

        {/* Footer brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "auto",
            paddingTop: 32,
            borderTop: `2px solid ${SAGE}33`,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: SAGE,
              marginRight: 16,
            }}
          />
          <div style={{ display: "flex", fontSize: 26, color: SAGE }}>
            {FOOTER}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fonts.length > 0 ? { fonts } : {}),
    }
  );
}
