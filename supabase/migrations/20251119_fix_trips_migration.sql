-- =====================================================
-- Fix Trips Migration - Create missing parts
-- =====================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.trips_with_stats;

-- Recreate the view for trips with location counts
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

-- Grant permissions on the view
GRANT SELECT ON public.trips_with_stats TO authenticated;
GRANT SELECT ON public.trips_with_stats TO service_role;
