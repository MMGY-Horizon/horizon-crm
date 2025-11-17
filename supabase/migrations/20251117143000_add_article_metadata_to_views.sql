-- Add article_name and article_type to article_views table
alter table public.article_views 
add column if not exists article_name text,
add column if not exists article_type text;

-- Create index for better query performance
create index if not exists idx_article_views_article_name on public.article_views (article_name);
create index if not exists idx_article_views_article_type on public.article_views (article_type);

-- Update the article_stats view to use article metadata from views when available
drop view if exists public.article_stats;

create or replace view public.article_stats as
select 
  coalesce(m.article_id, v.article_id) as article_id,
  coalesce(m.article_name, v.article_name, v.article_slug) as article_name,
  coalesce(m.article_slug, v.article_slug) as article_slug,
  coalesce(m.article_type, v.article_type, 'Article') as article_type,
  count(distinct m.chat_id) as mention_count,
  count(distinct v.id) as view_count,
  max(m.mentioned_at) as last_mentioned_at,
  max(v.viewed_at) as last_viewed_at
from public.article_mentions m
full outer join public.article_views v on v.article_id = m.article_id
group by coalesce(m.article_id, v.article_id), coalesce(m.article_name, v.article_name, v.article_slug), coalesce(m.article_slug, v.article_slug), coalesce(m.article_type, v.article_type, 'Article');

