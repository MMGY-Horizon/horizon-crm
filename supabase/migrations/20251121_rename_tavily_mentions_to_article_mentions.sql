-- Rename tavily_mentions to article_mentions
-- This migration handles dropping old tables and creating the new structure

-- Step 1: Drop both tables to start fresh
DROP TABLE IF EXISTS public.tavily_mentions CASCADE;
DROP TABLE IF EXISTS public.article_mentions CASCADE;

-- Step 2: Create article_mentions table with correct structure
CREATE TABLE public.article_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_url TEXT NOT NULL,
  article_title TEXT,
  article_type TEXT DEFAULT 'article', -- e.g., 'article', 'beach', 'deal', 'event', 'listing'
  chat_id TEXT,
  session_id TEXT NOT NULL,
  visitor_id TEXT,
  search_query TEXT,
  mentioned_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  organization_id UUID NOT NULL REFERENCES public.organization_settings(id) ON DELETE CASCADE,
  metadata JSONB
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_article_mentions_organization_id ON public.article_mentions (organization_id);
CREATE INDEX idx_article_mentions_article_url ON public.article_mentions (article_url);
CREATE INDEX idx_article_mentions_session_id ON public.article_mentions (session_id);
CREATE INDEX idx_article_mentions_mentioned_at ON public.article_mentions (mentioned_at DESC);
CREATE INDEX idx_article_mentions_clicked ON public.article_mentions (clicked);

-- Step 4: Enable RLS
ALTER TABLE public.article_mentions ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view article mentions for their organization" ON public.article_mentions;
DROP POLICY IF EXISTS "Service role can insert article mentions" ON public.article_mentions;
DROP POLICY IF EXISTS "Service role can update article mentions" ON public.article_mentions;

-- Step 6: Create RLS policies
CREATE POLICY "Users can view article mentions for their organization"
  ON public.article_mentions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert article mentions"
  ON public.article_mentions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update article mentions"
  ON public.article_mentions
  FOR UPDATE
  USING (true);
