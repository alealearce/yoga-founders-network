-- Founder Story pipeline: onboarding story answers + photos on listings, plus
-- the story post link and opt-out flag. See FOUNDER-STORY-SPEC.md §3.

alter table public.listings add column if not exists founder_story jsonb;
alter table public.listings add column if not exists founder_images text[] default '{}';
alter table public.listings add column if not exists story_opt_out boolean not null default false;
alter table public.listings add column if not exists story_post_id uuid references public.blog_posts(id);

-- Allow the new 'story' social_posts kind alongside the existing ones.
alter table public.social_posts drop constraint if exists social_posts_kind_check;
alter table public.social_posts add constraint social_posts_kind_check
  check (kind in ('blog', 'showcase', 'story'));
