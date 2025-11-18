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

-- Add unique constraint on api_key
ALTER TABLE public.organization_settings
ADD CONSTRAINT organization_settings_api_key_unique UNIQUE (api_key);

-- Create index on api_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_organization_settings_api_key ON public.organization_settings (api_key);
