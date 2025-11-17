-- =====================================================
-- MIGRATIONS TO APPLY MANUALLY IN SUPABASE DASHBOARD
-- =====================================================

-- Migration 1: Add article metadata to views
-- =====================================================

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


-- Migration 2: Create users table for team management
-- =====================================================

-- Create users table for team management
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  image text,
  role text default 'Member', -- Admin, Creator, Member
  provider text, -- google, email, etc.
  provider_id text, -- OAuth provider user ID
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_sign_in_at timestamptz
);

-- Create index for faster lookups
create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_provider_id on public.users (provider_id);

-- Enable RLS (Row Level Security)
alter table public.users enable row level security;

-- Create policy to allow authenticated users to read all users
create policy "Allow authenticated users to read users"
  on public.users
  for select
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- Create policy to allow users to update their own record
create policy "Allow users to update own record"
  on public.users
  for update
  using (auth.uid()::text = id::text);

-- Create trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

