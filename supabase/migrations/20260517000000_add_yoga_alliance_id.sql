-- Adds yoga_alliance_id for listings that hold a Yoga Alliance credential
-- (RYS or RYT identifier). Used to award a "Yoga Alliance Certified" badge.
alter table public.listings
  add column if not exists yoga_alliance_id text;

create index if not exists listings_ya_idx
  on public.listings (yoga_alliance_id)
  where yoga_alliance_id is not null;
