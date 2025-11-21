-- Add visitor_id column to chats table to link chats to identified visitors
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chats_visitor_id ON public.chats(visitor_id);

-- Note: user_id remains for backward compatibility and can store non-visitor user identifiers
