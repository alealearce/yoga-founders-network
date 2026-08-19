/**
 * Build one city guide per city with enough studios to be worth a page.
 *
 *   node scripts/build-city-guides.mjs            # report, write nothing
 *   node scripts/build-city-guides.mjs --write    # generate data/city-guides/*.json
 *
 * Why: the site's best-performing pages in Search Console are the guide
 * ("best yoga retreats montreal", 607 impressions) and the named profile
 * (ryan-leier, 439) — not the studio grid and not the daily blog. This builds
 * more of the shape that already works, out of the 620 listings we hold.
 *
 * These pages are an INDEX, not a ranking. Only 63 of 620 listings carry any
 * rating, so there is nothing honest to rank on — a "top 20" ordered by which
 * profiles happen to be filled in would be a ranking of our own data quality
 * wearing an authority costume. Studios are listed alphabetically, verified
 * ones marked, and the page says so.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'data', 'city-guides');

// A city needs real depth before a guide beats the existing search page.
const MIN_STUDIOS = 12;

function loadEnv() {
  const env = {};
  for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split('\n')) {
    const i = line.indexOf('=');
    if (i < 1 || line.trimStart().startsWith('#')) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const write = process.argv.includes('--write');
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('listings')
      .select('name, slug, type, city, country, address, website, description, yoga_styles, experience_levels, languages, is_verified, rating_avg, rating_count, status')
      .eq('status', 'approved')
      .eq('type', 'studio')
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < 1000) break;
  }

  const byCity = new Map();
  for (const l of rows) {
    if (!l.city) continue;
    const key = `${l.city}|${l.country ?? ''}`;
    if (!byCity.has(key)) byCity.set(key, []);
    byCity.get(key).push(l);
  }

  const viable = [...byCity.entries()]
    .filter(([, list]) => list.length >= MIN_STUDIOS)
    .sort((a, b) => b[1].length - a[1].length);

  console.log(`${rows.length} approved studios → ${viable.length} cities with ${MIN_STUDIOS}+\n`);

  const index = [];
  for (const [key, studios] of viable) {
    const [city, country] = key.split('|');
    const slug = `yoga-studios-${slugify(city)}`;

    // Style counts drive the page's "what this city is into" line — a real
    // observation from the data, not a generated paragraph.
    const styleCounts = new Map();
    for (const s of studios) {
      for (const style of s.yoga_styles ?? []) styleCounts.set(style, (styleCounts.get(style) ?? 0) + 1);
    }
    const topStyles = [...styleCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([style, count]) => ({ style, count }));

    const entries = studios
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((s) => ({
        name: s.name,
        url: `/yogastudio/${s.slug}`,
        address: s.address ?? null,
        website: s.website ?? null,
        styles: s.yoga_styles ?? [],
        levels: s.experience_levels ?? [],
        languages: s.languages ?? [],
        verified: !!s.is_verified,
        // Only carried when it rests on something; the page hides it otherwise.
        rating: s.rating_count > 0 ? { avg: Number(s.rating_avg.toFixed(1)), count: s.rating_count } : null,
      }));

    const guide = {
      slug,
      city,
      country,
      title: `Yoga Studios in ${city}`,
      generatedAt: new Date().toISOString().slice(0, 10),
      studioCount: entries.length,
      verifiedCount: entries.filter((e) => e.verified).length,
      ratedCount: entries.filter((e) => e.rating).length,
      topStyles,
      entries,
    };

    console.log(`  ${String(entries.length).padStart(3)} studios → /guides/${slug}`);
    index.push({ slug, city, country, title: guide.title, studioCount: entries.length, generatedAt: guide.generatedAt });

    if (write) {
      mkdirSync(OUT_DIR, { recursive: true });
      writeFileSync(join(OUT_DIR, `${slug}.json`), JSON.stringify(guide, null, 2) + '\n');
    }
  }

  if (write) {
    writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2) + '\n');
    console.log(`\nWrote ${index.length} guides + index.json to data/city-guides/`);
  } else {
    console.log('\nDry run — pass --write to generate the files.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
