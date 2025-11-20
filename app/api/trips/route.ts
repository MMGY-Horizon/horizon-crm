import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserOrganization } from "@/lib/get-user-organization";

export async function GET(request: NextRequest) {
  try {
    console.log("[Trips API] Starting request");

    const organizationId = await getUserOrganization();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitorId");
    const userId = searchParams.get("userId");

    console.log("[Trips API] Fetching trips for:", { organizationId, visitorId, userId });

    // Select trips with location count and visitor info
    let query = supabaseAdmin
      .from("trips")
      .select(`
        *,
        location_count:trip_locations(count),
        visitor:visitors(id, email, first_name, last_name)
      `)
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false });

    if (visitorId) {
      query = query.eq("visitor_id", visitorId);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: trips, error } = await query;

    if (error) {
      console.error("[Trips API] Error fetching trips:", error);
      return NextResponse.json(
        { error: "Failed to fetch trips", details: error.message },
        { status: 500 }
      );
    }

    // Process trips to flatten location_count
    const processedTrips = (trips || []).map(trip => ({
      ...trip,
      location_count: Array.isArray(trip.location_count) && trip.location_count.length > 0
        ? trip.location_count[0].count
        : 0
    }));

    console.log("[Trips API] Successfully fetched", processedTrips.length, "trips");
    return NextResponse.json({ trips: processedTrips });
  } catch (error) {
    console.error("[Trips API] Exception in trips endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
