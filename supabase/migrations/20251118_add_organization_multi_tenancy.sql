-- =====================================================
-- Add Organization Multi-Tenancy Support
-- =====================================================

-- Step 1: Add organization_id to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organization_settings(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.users (organization_id);

-- Set existing users to visit-fort-myers organization
UPDATE public.users
SET organization_id = (
  SELECT id FROM public.organization_settings WHERE slug = 'visit-fort-myers' LIMIT 1
)
WHERE organization_id IS NULL;

-- Make organization_id required for future inserts
ALTER TABLE public.users
ALTER COLUMN organization_id SET NOT NULL;


-- Step 2: Add organization_id to chats table
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organization_settings(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_chats_organization_id ON public.chats (organization_id);

UPDATE public.chats
SET organization_id = (
  SELECT id FROM public.organization_settings WHERE slug = 'visit-fort-myers' LIMIT 1
)
WHERE organization_id IS NULL;

ALTER TABLE public.chats
ALTER COLUMN organization_id SET NOT NULL;


-- Step 3: Add organization_id to visitors table
ALTER TABLE public.visitors
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organization_settings(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_visitors_organization_id ON public.visitors (organization_id);

UPDATE public.visitors
SET organization_id = (
  SELECT id FROM public.organization_settings WHERE slug = 'visit-fort-myers' LIMIT 1
)
WHERE organization_id IS NULL;

ALTER TABLE public.visitors
ALTER COLUMN organization_id SET NOT NULL;


-- Step 4: Add organization_id to article_mentions table
ALTER TABLE public.article_mentions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organization_settings(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_article_mentions_organization_id ON public.article_mentions (organization_id);

UPDATE public.article_mentions
SET organization_id = (
  SELECT id FROM public.organization_settings WHERE slug = 'visit-fort-myers' LIMIT 1
)
WHERE organization_id IS NULL;

ALTER TABLE public.article_mentions
ALTER COLUMN organization_id SET NOT NULL;


-- Step 5: Add organization_id to article_views table
ALTER TABLE public.article_views
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organization_settings(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_article_views_organization_id ON public.article_views (organization_id);

UPDATE public.article_views
SET organization_id = (
  SELECT id FROM public.organization_settings WHERE slug = 'visit-fort-myers' LIMIT 1
)
WHERE organization_id IS NULL;

ALTER TABLE public.article_views
ALTER COLUMN organization_id SET NOT NULL;


-- Step 6: Update article_stats view to include organization_id
DROP VIEW IF EXISTS public.article_stats;

CREATE OR REPLACE VIEW public.article_stats AS
SELECT
  coalesce(m.article_id, v.article_id) as article_id,
  coalesce(m.article_name, v.article_name, v.article_slug) as article_name,
  coalesce(m.article_slug, v.article_slug) as article_slug,
  coalesce(m.article_type, v.article_type, 'Article') as article_type,
  coalesce(m.organization_id, v.organization_id) as organization_id,
  count(distinct m.chat_id) as mention_count,
  count(distinct v.id) as view_count,
  max(m.mentioned_at) as last_mentioned_at,
  max(v.viewed_at) as last_viewed_at
FROM public.article_mentions m
FULL OUTER JOIN public.article_views v ON v.article_id = m.article_id AND v.organization_id = m.organization_id
GROUP BY
  coalesce(m.article_id, v.article_id),
  coalesce(m.article_name, v.article_name, v.article_slug),
  coalesce(m.article_slug, v.article_slug),
  coalesce(m.article_type, v.article_type, 'Article'),
  coalesce(m.organization_id, v.organization_id);


-- Step 7: Update chats_with_counts view to include organization_id
DROP VIEW IF EXISTS public.chats_with_counts;

CREATE OR REPLACE VIEW public.chats_with_counts AS
SELECT
  c.*,
  count(m.id) as message_count,
  max(m.created_at) as last_message_at
FROM public.chats c
LEFT JOIN public.messages m ON m.chat_id = c.chat_id
GROUP BY c.id;


-- Step 8: Update RLS policies for multi-tenancy

-- Users table policies
DROP POLICY IF EXISTS "Allow all authenticated to read users" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "Service role can update users" ON public.users;
DROP POLICY IF EXISTS "Service role can delete users" ON public.users;

CREATE POLICY "Users can read own organization users"
  ON public.users
  FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()::uuid
    )
  );

CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update users"
  ON public.users
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete users"
  ON public.users
  FOR DELETE
  TO service_role
  USING (true);


-- Chats table policies (if RLS enabled)
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can read all chats" ON public.chats;
DROP POLICY IF EXISTS "Service role can insert chats" ON public.chats;
DROP POLICY IF EXISTS "Service role can update chats" ON public.chats;

CREATE POLICY "Service role can access all chats"
  ON public.chats
  FOR ALL
  TO service_role
  USING (true);


-- Visitors table policies
DROP POLICY IF EXISTS "Allow authenticated users to read visitors" ON public.visitors;
DROP POLICY IF EXISTS "Service role can insert visitors" ON public.visitors;
DROP POLICY IF EXISTS "Service role can update visitors" ON public.visitors;
DROP POLICY IF EXISTS "Service role can delete visitors" ON public.visitors;

CREATE POLICY "Service role can access all visitors"
  ON public.visitors
  FOR ALL
  TO service_role
  USING (true);


-- Messages table policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access all messages"
  ON public.messages
  FOR ALL
  TO service_role
  USING (true);


-- Article mentions policies
ALTER TABLE public.article_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access all article_mentions"
  ON public.article_mentions
  FOR ALL
  TO service_role
  USING (true);


-- Article views policies
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access all article_views"
  ON public.article_views
  FOR ALL
  TO service_role
  USING (true);
