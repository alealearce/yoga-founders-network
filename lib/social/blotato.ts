/**
 * blotato.ts — Posting client for Blotato (https://blotato.com).
 *
 * Blotato is a verified social publisher: connect Instagram / Facebook / LinkedIn
 * in its dashboard (normal login, no Meta business verification) and publish
 * through its API. This avoids the direct Meta Graph API path, which needs
 * business verification.
 *
 * Flow: upload each rendered slide → Blotato returns a hosted URL → publish the
 * set as a single carousel post to each configured platform.
 *
 * Env (see .env.local):
 *   BLOTATO_API_KEY                — Settings → API in the Blotato dashboard.
 *   BLOTATO_INSTAGRAM_ACCOUNT_ID   — IG account id (Settings → Social Accounts).
 *   BLOTATO_FACEBOOK_ACCOUNT_ID    — optional, FB account id.
 *   BLOTATO_FACEBOOK_PAGE_ID       — optional, numeric FB Page id.
 *   BLOTATO_LINKEDIN_ACCOUNT_ID    — optional, LinkedIn account id.
 */

const BASE = 'https://backend.blotato.com';

export type Platform = 'instagram' | 'facebook' | 'linkedin';

export class BlotatoConfigError extends Error {}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

/** Which platforms are wired up (have an account id configured). */
export function configuredPlatforms(): Platform[] {
  const out: Platform[] = [];
  if (env('BLOTATO_INSTAGRAM_ACCOUNT_ID')) out.push('instagram');
  if (env('BLOTATO_FACEBOOK_ACCOUNT_ID') && env('BLOTATO_FACEBOOK_PAGE_ID')) out.push('facebook');
  if (env('BLOTATO_LINKEDIN_ACCOUNT_ID')) out.push('linkedin');
  return out;
}

export function isConfigured(): boolean {
  return Boolean(env('BLOTATO_API_KEY')) && configuredPlatforms().length > 0;
}

async function blotatoPost(path: string, body: unknown): Promise<Record<string, unknown>> {
  const key = env('BLOTATO_API_KEY');
  if (!key) throw new BlotatoConfigError('Missing BLOTATO_API_KEY');
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'blotato-api-key': key },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const err = json.error as { message?: string } | undefined;
    const msg = err?.message || (json.message as string | undefined) || `Blotato ${path} failed (${res.status})`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return json;
}

/** Upload a publicly-reachable image; returns a Blotato-hosted URL for publishing. */
export async function uploadMedia(sourceUrl: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const json = await blotatoPost('/v2/media', { url: sourceUrl });
    if (!json?.url) return { ok: false, error: 'Blotato media upload returned no url' };
    return { ok: true, url: json.url as string };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Upload several slides in order; fails fast if any one fails. */
export async function uploadAll(urls: string[]): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  const hosted: string[] = [];
  for (const u of urls) {
    const r = await uploadMedia(u);
    if (!r.ok) return { ok: false, error: r.error };
    hosted.push(r.url);
  }
  return { ok: true, urls: hosted };
}

type PublishResult = { ok: true; id: string } | { ok: false; error: string };

function pickId(json: Record<string, unknown>): string {
  const post = json.post as { id?: string } | undefined;
  return String(json.submissionId ?? json.id ?? post?.id ?? '');
}

function targetFor(platform: Platform): Record<string, unknown> {
  switch (platform) {
    case 'instagram':
      return { targetType: 'instagram' };
    case 'facebook':
      return { targetType: 'facebook', pageId: env('BLOTATO_FACEBOOK_PAGE_ID') };
    case 'linkedin':
      return { targetType: 'linkedin' };
  }
}

function accountIdFor(platform: Platform): string {
  const map: Record<Platform, string> = {
    instagram: 'BLOTATO_INSTAGRAM_ACCOUNT_ID',
    facebook: 'BLOTATO_FACEBOOK_ACCOUNT_ID',
    linkedin: 'BLOTATO_LINKEDIN_ACCOUNT_ID',
  };
  const id = env(map[platform]);
  if (!id) throw new BlotatoConfigError(`Missing account id for ${platform}`);
  return id;
}

/**
 * Publish a (single- or multi-image carousel) post to one platform.
 * `mediaUrls` must be Blotato-hosted URLs from uploadMedia/uploadAll.
 */
export async function publish(platform: Platform, mediaUrls: string[], caption: string): Promise<PublishResult> {
  try {
    const json = await blotatoPost('/v2/posts', {
      post: {
        accountId: accountIdFor(platform),
        content: { text: caption, mediaUrls, platform },
        target: targetFor(platform),
      },
    });
    return { ok: true, id: pickId(json) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
