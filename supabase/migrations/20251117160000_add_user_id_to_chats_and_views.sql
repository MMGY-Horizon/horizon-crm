-- Add user_id column to chats table
alter table public.chats
add column if not exists user_id uuid references public.users(id) on delete set null;

-- Add user_id column to article_views table  
alter table public.article_views
add column if not exists user_id uuid references public.users(id) on delete set null;

-- Create indexes for faster lookups
create index if not exists idx_chats_user_id on public.chats (user_id);
create index if not exists idx_article_views_user_id on public.article_views (user_id);

-- Update the Visitor role to be valid (add it if needed)
-- This allows newsletter signups to be tracked as "Visitors"

