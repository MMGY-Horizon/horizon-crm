-- Add visitor_id column if it doesn't exist (idempotent)
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_chats_visitor_id ON public.chats(visitor_id);

-- Same for article_views
ALTER TABLE public.article_views
ADD COLUMN IF NOT EXISTS visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_article_views_visitor_id ON public.article_views(visitor_id);
