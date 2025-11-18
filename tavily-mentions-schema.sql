-- Create tavily_mentions table to track when external articles appear in Tavily search results
CREATE TABLE IF NOT EXISTS public.tavily_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_url TEXT NOT NULL,
  article_title TEXT,
  article_type TEXT DEFAULT 'external',
  chat_id TEXT REFERENCES public.chats(chat_id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
  search_query TEXT,
  mentioned_at TIMESTAMPTZ DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tavily_mentions_article_url ON public.tavily_mentions(article_url);
CREATE INDEX IF NOT EXISTS idx_tavily_mentions_chat_id ON public.tavily_mentions(chat_id);
CREATE INDEX IF NOT EXISTS idx_tavily_mentions_session_id ON public.tavily_mentions(session_id);
CREATE INDEX IF NOT EXISTS idx_tavily_mentions_visitor_id ON public.tavily_mentions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_tavily_mentions_mentioned_at ON public.tavily_mentions(mentioned_at DESC);
CREATE INDEX IF NOT EXISTS idx_tavily_mentions_clicked ON public.tavily_mentions(clicked);
