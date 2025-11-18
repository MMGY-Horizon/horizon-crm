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
