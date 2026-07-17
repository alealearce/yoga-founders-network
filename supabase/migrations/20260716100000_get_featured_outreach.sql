-- Get Featured outreach engine (Phase 1): magic-link invite tokens on listings
-- + an audit log of outreach sends. See app/api/admin/spotlight-invites/route.ts
-- (DISARMED — not wired into vercel.json crons) and app/[locale]/get-featured.

alter table public.listings add column if not exists invite_token uuid not null default gen_random_uuid();
create unique index if not exists listings_invite_token_idx on public.listings(invite_token);
alter table public.listings add column if not exists outreach_opt_out boolean not null default false;

create table if not exists public.outreach_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  kind text not null check (kind in ('spotlight_invite_1','spotlight_invite_2','spotlight_invite_3')),
  email text not null,
  status text not null default 'sent' check (status in ('sent','failed')),
  error_message text
);
create index if not exists outreach_log_listing_idx on public.outreach_log(listing_id);

-- Service-role only (admin route writes these); no public access.
alter table public.outreach_log enable row level security;
