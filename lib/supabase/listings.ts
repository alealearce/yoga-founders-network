import type { SupabaseClient } from '@supabase/supabase-js';
import type { Listing, ListingType } from './types';

// The type pages (/yogastudio, /yogateacher, /yogaschool, ...) load every
// approved listing of a type; the browser then sorts by distance and filters.
// Until 2026-11-02 each page read `.limit(500)` while 571 studios were
// approved, so 71 never showed. The API also caps one read at 1,000 rows, so
// this reads in pages until a short one, with `id` last so pages don't overlap.
// A shortfall is logged; the daily error sweep reads the logs.
export const LISTINGS_PAGE_SIZE = 1000;

export async function fetchApprovedListings(
  supabase: SupabaseClient,
  type: ListingType,
  sortBy: 'rating_avg' | 'created_at' = 'rating_avg',
): Promise<{ listings: Listing[]; total: number }> {
  const listings: Listing[] = [];
  let total = 0;
  for (let from = 0; ; from += LISTINGS_PAGE_SIZE) {
    const { data, count, error } = await supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .eq('type', type)
      .order('is_featured', { ascending: false })
      .order(sortBy, { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + LISTINGS_PAGE_SIZE - 1);
    if (error) {
      console.error(`[listings] ${type} read failed:`, error.message);
      break;
    }
    total = count ?? total;
    listings.push(...((data ?? []) as Listing[]));
    if (!data || data.length < LISTINGS_PAGE_SIZE) break;
  }
  if (listings.length !== total) {
    console.error(`[listings] ${type} page shows ${listings.length} of ${total} approved`);
  }
  return { listings, total };
}
