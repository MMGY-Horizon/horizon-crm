import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUserOrganization } from "@/lib/get-user-organization";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const organizationId = await getUserOrganization();
    if (!organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await params;

    // Fetch trip
    const { data: trip, error: tripError } = await supabaseAdmin
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .eq("organization_id", organizationId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    // Fetch trip locations
    const { data: locations, error: locationsError } = await supabaseAdmin
      .from("trip_locations")
      .select("*")
      .eq("trip_id", tripId)
      .order("added_at", { ascending: true });

    if (locationsError) {
      console.error("Error fetching trip locations:", locationsError);
      return NextResponse.json(
        { error: "Failed to fetch trip locations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      trip: {
        ...trip,
        locations: locations || [],
      },
    });
  } catch (error) {
    console.error("Error in trip detail endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
