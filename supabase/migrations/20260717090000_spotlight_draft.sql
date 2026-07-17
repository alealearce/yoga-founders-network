-- Spotlight draft-then-publish flow: persist the pull quote chosen at
-- generation time so the social carousel (published later, after admin
-- preview) uses the same verbatim founder line.
alter table public.blog_posts add column if not exists pull_quote text;
