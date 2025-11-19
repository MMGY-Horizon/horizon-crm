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

    let query = supabaseAdmin
      .from("trips")
      .select("*")
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

    console.log("[Trips API] Successfully fetched", trips?.length || 0, "trips");
    return NextResponse.json({ trips: trips || [] });
  } catch (error) {
    console.error("[Trips API] Exception in trips endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
