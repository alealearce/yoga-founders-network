import { SITE, LISTING_TYPES } from '@/lib/config/site';

const BASE = SITE.url;

const TYPE_PREFIXES: Record<string, string> = {
  studio:   '/yogastudio',
  teacher:  '/yogateacher',
  school:   '/yogaschool',
  retreat:  '/retreatcenter',
  product:  '/yogaproducts',
  workshop: '/yogaworkshops',
};

export const revalidate = 86400;

export async function GET() {
  const categoryLines = LISTING_TYPES.map(
    (t) => `- [${t.label}](${BASE}${TYPE_PREFIXES[t.id]}): Verified ${t.label.toLowerCase()} listed on ${SITE.name}.`,
  ).join('\n');

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} is a global directory connecting practitioners with verified yoga studios, teachers, schools, retreat centers, products, and workshops. Every listing includes contact details, location, yoga styles taught, and (where supplied) imagery and reviews.

## About

- [About ${SITE.name}](${BASE}/about): Mission, story, and how listings are verified.
- [The Journal](${BASE}/community): Editorial articles and community stories.
- [Resources](${BASE}/resources): Guides and tools for yoga teachers and studio owners.

## Browse the Directory

${categoryLines}

## Search

- [Site Search](${BASE}/search?q=): Full-text search across all listings. Use \`?q={query}\`.

## For Yoga Founders

- [List Your Space](${BASE}/submit): Add a studio, teaching practice, school, retreat, product, or workshop.
- [Sign in](${BASE}/login): Manage your listings.

## API / Agent Access

A machine-readable index of all approved listings is available at [${BASE}/llms-full.txt](${BASE}/llms-full.txt). XML sitemap: [${BASE}/sitemap.xml](${BASE}/sitemap.xml).

For automated access requests or data partnerships, contact ${SITE.supportEmail}.

## Contact

- Email: ${SITE.supportEmail}
- Web: ${BASE}
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
