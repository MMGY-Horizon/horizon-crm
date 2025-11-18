-- Create article_mentions table to track when articles appear in Tavily search results
CREATE TABLE IF NOT EXISTS public.article_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_url TEXT NOT NULL,
  article_title TEXT,
  article_type TEXT,
  chat_id TEXT REFERENCES public.chats(chat_id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
  mentioned_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_article_mentions_article_url ON public.article_mentions(article_url);
CREATE INDEX IF NOT EXISTS idx_article_mentions_chat_id ON public.article_mentions(chat_id);
CREATE INDEX IF NOT EXISTS idx_article_mentions_session_id ON public.article_mentions(session_id);
CREATE INDEX IF NOT EXISTS idx_article_mentions_visitor_id ON public.article_mentions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_article_mentions_mentioned_at ON public.article_mentions(mentioned_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_mentions_clicked ON public.article_mentions(clicked);
