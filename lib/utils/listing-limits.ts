// One source for the listing field limits: the submit route's zod schema and
// the claim/submit form both read these, so the form can never let through
// text the server will refuse (that mismatch made visitors retry 3-5 times
// before finding the limit, Nov 11-12 2026).
export const LISTING_LIMITS = {
  name: 100,
  description: 2000,
} as const;
