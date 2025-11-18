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


-- Migration 3: Create organization_settings table
-- =====================================================

-- Create organization_settings table
CREATE TABLE IF NOT EXISTS public.organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  organization_name TEXT NOT NULL,
  location TEXT,
  website_url TEXT,
  status TEXT DEFAULT 'live',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organization_settings_slug ON public.organization_settings (slug);

-- Enable RLS (Row Level Security)
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read settings
CREATE POLICY "Allow authenticated users to read organization settings"
  ON public.organization_settings
  FOR SELECT
  TO authenticated, anon, service_role
  USING (true);

-- Allow service role to insert/update settings
CREATE POLICY "Service role can insert organization settings"
  ON public.organization_settings
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update organization settings"
  ON public.organization_settings
  FOR UPDATE
  TO service_role
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_organization_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_organization_settings_updated_at
  BEFORE UPDATE ON public.organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_organization_settings_updated_at();

-- Insert default settings for Visit Fort Myers
INSERT INTO public.organization_settings (slug, organization_name, location, website_url, status)
VALUES (
  'visit-fort-myers',
  'Visit Fort Myers',
  'Fort Myers, Fort Myers Beach, Sanibel Island, Captiva Island, Cape Coral, Estero, Bonita Springs',
  'https://www.visitfortmyers.com',
  'live'
)
ON CONFLICT (slug) DO NOTHING;


-- Migration 4: Add API key to organization_settings
-- =====================================================

-- Add api_key field to organization_settings table
ALTER TABLE public.organization_settings
ADD COLUMN IF NOT EXISTS api_key TEXT;

-- Create a function to generate a random API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'hmz_'; -- Horizon prefix
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing row with an API key if it doesn't have one
UPDATE public.organization_settings
SET api_key = generate_api_key()
WHERE api_key IS NULL;

-- Make api_key required for future inserts
ALTER TABLE public.organization_settings
ALTER COLUMN api_key SET NOT NULL;

-- Add unique constraint on api_key
ALTER TABLE public.organization_settings
ADD CONSTRAINT organization_settings_api_key_unique UNIQUE (api_key);

-- Create index on api_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_organization_settings_api_key ON public.organization_settings (api_key);

