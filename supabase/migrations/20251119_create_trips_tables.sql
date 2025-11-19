-- =====================================================
-- Create Trips and Trip Locations Tables
-- =====================================================

-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  days INTEGER,
  image TEXT,
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organization_settings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create trip_locations table
CREATE TABLE IF NOT EXISTS public.trip_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_visitor_id ON public.trips (visitor_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips (user_id);
CREATE INDEX IF NOT EXISTS idx_trips_organization_id ON public.trips (organization_id);
CREATE INDEX IF NOT EXISTS idx_trips_updated_at ON public.trips (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_trip_locations_trip_id ON public.trip_locations (trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_locations_coordinates ON public.trip_locations (lat, lng);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trips table
CREATE POLICY "Service role can access all trips"
  ON public.trips
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Authenticated users can read trips in their organization"
  ON public.trips
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()::uuid
    )
  );

-- RLS Policies for trip_locations table
CREATE POLICY "Service role can access all trip_locations"
  ON public.trip_locations
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Authenticated users can read trip_locations in their organization"
  ON public.trip_locations
  FOR SELECT
  TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM public.trips WHERE organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()::uuid
      )
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for trips with location counts
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

-- Grant permissions
GRANT SELECT ON public.trips_with_stats TO authenticated;
GRANT SELECT ON public.trips_with_stats TO service_role;
