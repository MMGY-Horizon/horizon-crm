-- Article mentions table (tracks when articles appear in chat results)
create table if not exists public.article_mentions (
  id uuid primary key default uuid_generate_v4(),
  article_id text not null,
  article_name text not null,
  article_slug text not null,
  article_type text, -- e.g., 'Attraction', 'Restaurant', 'Activity'
  chat_id text references public.chats(chat_id) on delete cascade,
  mentioned_at timestamptz default now()
);

-- Article views table (tracks when users click to view article detail pages)
create table if not exists public.article_views (
  id uuid primary key default uuid_generate_v4(),
  article_id text not null,
  article_slug text not null,
  chat_id text, -- optional, may not have if user views directly
  session_id text, -- optional, for tracking without chat
  viewed_at timestamptz default now()
);

-- Indexes for article tracking
create index if not exists idx_article_mentions_article_id on public.article_mentions (article_id);
create index if not exists idx_article_mentions_chat_id on public.article_mentions (chat_id);
create index if not exists idx_article_mentions_mentioned_at on public.article_mentions (mentioned_at desc);
create index if not exists idx_article_views_article_id on public.article_views (article_id);
create index if not exists idx_article_views_viewed_at on public.article_views (viewed_at desc);

-- View for article stats
create or replace view public.article_stats as
select 
  m.article_id,
  m.article_name,
  m.article_slug,
  m.article_type,
  count(distinct m.chat_id) as mention_count,
  count(distinct v.id) as view_count,
  max(m.mentioned_at) as last_mentioned_at,
  max(v.viewed_at) as last_viewed_at
from public.article_mentions m
left join public.article_views v on v.article_id = m.article_id
group by m.article_id, m.article_name, m.article_slug, m.article_type;

