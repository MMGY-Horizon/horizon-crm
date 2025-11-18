-- Add organization_id to tavily_mentions table

-- Step 1: Add the column as nullable first
ALTER TABLE public.tavily_mentions
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organization_settings(id) ON DELETE CASCADE;

-- Step 2: Set existing records to visit-fort-myers organization
UPDATE public.tavily_mentions
SET organization_id = (
  SELECT id FROM public.organization_settings WHERE slug = 'visit-fort-myers' LIMIT 1
)
WHERE organization_id IS NULL;

-- Step 3: Make it required
ALTER TABLE public.tavily_mentions
ALTER COLUMN organization_id SET NOT NULL;

-- Step 4: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tavily_mentions_organization_id ON public.tavily_mentions (organization_id);
