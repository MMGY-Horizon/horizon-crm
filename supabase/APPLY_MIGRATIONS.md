# Apply Pending Migrations

The Supabase CLI is experiencing connectivity issues. Please apply these migrations manually in the Supabase Dashboard SQL Editor.

## Instructions

1. Go to https://supabase.com/dashboard/project/kjmbafzpzjmcupmapvac/sql/new
2. Copy and paste the SQL below
3. Click "Run" to execute

## SQL to Execute

```sql
-- =====================================================
-- Create organization_settings table
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

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow authenticated users to read organization settings" ON public.organization_settings;
DROP POLICY IF EXISTS "Service role can insert organization settings" ON public.organization_settings;
DROP POLICY IF EXISTS "Service role can update organization settings" ON public.organization_settings;

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


-- =====================================================
-- Add API key to organization_settings
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

-- Drop constraint if it exists (for idempotency)
ALTER TABLE public.organization_settings
DROP CONSTRAINT IF EXISTS organization_settings_api_key_unique;

-- Add unique constraint on api_key
ALTER TABLE public.organization_settings
ADD CONSTRAINT organization_settings_api_key_unique UNIQUE (api_key);

-- Create index on api_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_organization_settings_api_key ON public.organization_settings (api_key);
```

## Verification

After running the SQL, verify the table was created:

```sql
SELECT * FROM public.organization_settings;
```

You should see one row with the Visit Fort Myers organization data and an API key starting with `hmz_`.
