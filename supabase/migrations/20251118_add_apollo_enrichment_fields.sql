-- =====================================================
-- Add Apollo.io Enrichment Fields to Visitors Table
-- =====================================================
-- This migration adds fields to store enriched data from Apollo.io's
-- People Enrichment API. These fields are populated when a visitor's
-- email is confirmed and enrichment is triggered.

-- Add Apollo person data fields
ALTER TABLE public.visitors
ADD COLUMN IF NOT EXISTS apollo_id TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT;

-- Add Apollo organization data fields
ALTER TABLE public.visitors
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS company_industry TEXT;

-- Add enrichment tracking fields
ALTER TABLE public.visitors
ADD COLUMN IF NOT EXISTS apollo_enriched_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS apollo_last_synced_at TIMESTAMPTZ;

-- Create index on apollo_id for lookups
CREATE INDEX IF NOT EXISTS idx_visitors_apollo_id ON public.visitors (apollo_id);

-- Create index on company_name for filtering/searching
CREATE INDEX IF NOT EXISTS idx_visitors_company_name ON public.visitors (company_name);

-- Create index on apollo_enriched_at to track enrichment status
CREATE INDEX IF NOT EXISTS idx_visitors_apollo_enriched_at ON public.visitors (apollo_enriched_at);

-- Add comment to document the enrichment flow
COMMENT ON COLUMN public.visitors.apollo_enriched_at IS 'Timestamp when visitor was first enriched with Apollo data. NULL means never enriched.';
COMMENT ON COLUMN public.visitors.apollo_last_synced_at IS 'Timestamp of the most recent Apollo sync attempt (successful or failed).';
