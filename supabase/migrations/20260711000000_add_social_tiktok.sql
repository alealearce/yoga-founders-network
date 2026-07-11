-- Add TikTok to the listing social links (submit form + listing page).
alter table public.listings add column if not exists social_tiktok text;
