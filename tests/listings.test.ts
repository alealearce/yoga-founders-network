// Type pages must show every approved listing (the 500-row cap hid 71 studios).
// Run: npx tsx --test tests/listings.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchApprovedListings, LISTINGS_PAGE_SIZE } from '../lib/supabase/listings';

// Stands in for the query builder: returns rows[from..to] and the full count,
// or fails the given read.
function fakeDb(total: number, failOnRead?: number) {
  const reads: [number, number][] = [];
  const rows = Array.from({ length: total }, (_, i) => ({ id: String(i) }));
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    range: async (from: number, to: number) => {
      reads.push([from, to]);
      if (reads.length === failOnRead) return { data: null, count: null, error: { message: 'boom' } };
      return { data: rows.slice(from, to + 1), count: total, error: null };
    },
  };
  return { db: { from: () => builder } as unknown as SupabaseClient, reads };
}

function quietErrors() {
  const logged: string[] = [];
  const original = console.error;
  console.error = (...a: unknown[]) => { logged.push(a.join(' ')); };
  return { logged, restore: () => { console.error = original; } };
}

test('reads past the API row cap until every approved listing is in', async () => {
  const { db, reads } = fakeDb(2350);
  const { listings, total } = await fetchApprovedListings(db, 'studio');
  assert.equal(total, 2350);
  assert.equal(listings.length, 2350);
  assert.equal(new Set(listings.map((l) => l.id)).size, 2350);
  assert.deepEqual(reads, [[0, 999], [1000, 1999], [2000, 2999]]);
});

test('571 studios all come back in one read', async () => {
  const { db, reads } = fakeDb(571);
  const { listings } = await fetchApprovedListings(db, 'studio');
  assert.equal(listings.length, 571);
  assert.equal(reads.length, 1);
});

test('an exact multiple of the page size stops on the empty read', async () => {
  const { db, reads } = fakeDb(LISTINGS_PAGE_SIZE);
  const { listings } = await fetchApprovedListings(db, 'teacher');
  assert.equal(listings.length, LISTINGS_PAGE_SIZE);
  assert.equal(reads.length, 2);
});

test('a failed read is logged with the shortfall', async () => {
  const { db } = fakeDb(2350, 2);
  const errors = quietErrors();
  try {
    const { listings } = await fetchApprovedListings(db, 'studio');
    assert.equal(listings.length, 1000);
  } finally {
    errors.restore();
  }
  assert.ok(errors.logged.some((l) => l.includes('studio read failed')));
  assert.ok(errors.logged.some((l) => l.includes('shows 1000 of 2350')));
});
