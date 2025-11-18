-- Create visitors table (separate from team users)
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  source text default 'newsletter', -- newsletter, organic, etc.
  created_at timestamptz default now(),
  last_active_at timestamptz,
  metadata jsonb default '{}'::jsonb -- for any additional data
);

-- Create indexes for faster lookups
create index if not exists idx_visitors_email on public.visitors (email);
create index if not exists idx_visitors_source on public.visitors (source);
create index if not exists idx_visitors_created_at on public.visitors (created_at);

-- Enable RLS (Row Level Security)
alter table public.visitors enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Allow authenticated users to read visitors" on public.visitors;
drop policy if exists "Service role can insert visitors" on public.visitors;
drop policy if exists "Service role can update visitors" on public.visitors;
drop policy if exists "Service role can delete visitors" on public.visitors;

-- Create policy to allow authenticated users to read all visitors
create policy "Allow authenticated users to read visitors"
  on public.visitors
  for select
  to authenticated, anon, service_role
  using (true);

-- Allow service role full access
create policy "Service role can insert visitors"
  on public.visitors
  for insert
  to service_role
  with check (true);

create policy "Service role can update visitors"
  on public.visitors
  for update
  to service_role
  using (true);

create policy "Service role can delete visitors"
  on public.visitors
  for delete
  to service_role
  using (true);

-- Create trigger to update last_active_at
create or replace function public.handle_visitor_activity()
returns trigger as $$
begin
  new.last_active_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_visitor_activity
  before update on public.visitors
  for each row
  execute function public.handle_visitor_activity();

-- Update chats table to reference visitors instead of users for visitor data
alter table public.chats
drop constraint if exists chats_user_id_fkey,
add column if not exists visitor_id uuid references public.visitors(id) on delete set null;

-- Update article_views table to reference visitors
alter table public.article_views
drop constraint if exists article_views_user_id_fkey,
add column if not exists visitor_id uuid references public.visitors(id) on delete set null;

-- Create indexes for new foreign keys
create index if not exists idx_chats_visitor_id on public.chats (visitor_id);
create index if not exists idx_article_views_visitor_id on public.article_views (visitor_id);

-- Migrate existing visitor data from users table to visitors table
-- (users with role='Visitor' or provider='newsletter')
insert into public.visitors (id, email, name, source, created_at, last_active_at)
select 
  id,
  email,
  name,
  coalesce(provider, 'newsletter') as source,
  created_at,
  last_sign_in_at as last_active_at
from public.users
where role = 'Visitor' or provider = 'newsletter'
on conflict (id) do nothing;

-- Migrate user_id to visitor_id in chats (only where user_id exists in visitors table)
-- Note: user_id might be text or uuid depending on migration state, so we cast to text for comparison
update public.chats c
set visitor_id = v.id
from public.visitors v
where c.user_id is not null 
  and c.user_id::text = v.id::text;

-- Migrate user_id to visitor_id in article_views (only where user_id exists in visitors table)
-- Note: user_id might be text or uuid depending on migration state, so we cast to text for comparison
update public.article_views av
set visitor_id = v.id
from public.visitors v
where av.user_id is not null 
  and av.user_id::text = v.id::text;

-- Remove visitors from users table
delete from public.users where role = 'Visitor' or provider = 'newsletter';

