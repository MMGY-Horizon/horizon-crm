-- =====================================================
-- Complete Trips Migration - Safe to run multiple times
-- =====================================================

-- Drop existing objects if they exist
DROP VIEW IF EXISTS public.trips_with_stats CASCADE;
DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
DROP TRIGGER IF EXISTS update_trip_locations_updated_at ON public.trip_locations;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP TABLE IF EXISTS public.trip_locations CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;

-- =====================================================
-- Create Tables
-- =====================================================

-- Trips table
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  days INTEGER,
  image_url TEXT,
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organization_settings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip locations table
CREATE TABLE public.trip_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Create Indexes
-- =====================================================

CREATE INDEX idx_trips_visitor_id ON public.trips(visitor_id);
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_organization_id ON public.trips(organization_id);
CREATE INDEX idx_trip_locations_trip_id ON public.trip_locations(trip_id);
CREATE INDEX idx_trip_locations_coordinates ON public.trip_locations(latitude, longitude);

-- =====================================================
-- Create Triggers for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Create View
-- =====================================================

CREATE OR REPLACE VIEW public.trips_with_stats AS
SELECT
  t.*,
  COUNT(tl.id) as location_count,
  v.id as visitor_id_ref,
  v.email as visitor_email,
  u.email as user_email,
  u.name as user_name
FROM public.trips t
LEFT JOIN public.trip_locations tl ON tl.trip_id = t.id
LEFT JOIN public.visitors v ON v.id = t.visitor_id
LEFT JOIN public.users u ON u.id = t.user_id
GROUP BY t.id, v.id, v.email, u.email, u.name;

-- =====================================================
-- Set up Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can access all trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view trips in their organization" ON public.trips;
DROP POLICY IF EXISTS "Service role can access all trip locations" ON public.trip_locations;
DROP POLICY IF EXISTS "Users can view trip locations in their organization" ON public.trip_locations;

-- Policies for trips table
CREATE POLICY "Service role can access all trips"
  ON public.trips
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view trips in their organization"
  ON public.trips
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policies for trip_locations table
CREATE POLICY "Service role can access all trip locations"
  ON public.trip_locations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view trip locations in their organization"
  ON public.trip_locations
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM public.trips
      WHERE organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- Grant Permissions
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_locations TO service_role;
GRANT SELECT ON public.trips TO authenticated;
GRANT SELECT ON public.trip_locations TO authenticated;
GRANT SELECT ON public.trips_with_stats TO authenticated;
GRANT SELECT ON public.trips_with_stats TO service_role;
