/**
 * Founder Spotlight eligibility — client-safe (no server-only imports), so the
 * admin UI can share the exact rule used by the pipeline in lib/social/story.ts.
 */

import { FOUNDER_QUESTIONS, type FounderQuestionKey } from '@/lib/config/site';
import type { Listing } from '@/lib/supabase/types';

export type StoryEligibilityFields = Pick<
  Listing,
  'founder_story' | 'founder_images' | 'story_opt_out' | 'story_post_id'
>;

/** Returns null when eligible, else a human-readable skip reason. */
export function ineligibleReason(listing: StoryEligibilityFields): string | null {
  if (listing.story_opt_out) return 'founder opted out of the story pipeline';
  if (listing.story_post_id) return 'a spotlight has already been published for this listing';
  const answered = FOUNDER_QUESTIONS.filter((q) => {
    const v = listing.founder_story?.[q.key as FounderQuestionKey];
    return typeof v === 'string' && v.trim().length > 0;
  }).length;
  if (answered < 3) return `only ${answered} of 5 story questions answered (need at least 3)`;
  if (!listing.founder_images || listing.founder_images.length < 1) return 'no founder photos uploaded';
  return null;
}

export function isStoryEligible(listing: StoryEligibilityFields): boolean {
  return ineligibleReason(listing) === null;
}
