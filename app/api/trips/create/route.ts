import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorizeRequest } from "@/lib/api-auth";

interface TripLocation {
  name: string;
  lat: number;
  lng: number;
  description?: string;
  addedAt: number;
}

interface CreateTripPayload {
  visitorId: string;
  trip: {
    id: string;
    name: string;
    destination: string;
    startDate?: string;
    endDate?: string;
    days?: number;
    image?: string;
    locations: TripLocation[];
    createdAt: number;
    updatedAt: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Create Trip API] Starting request");

    // Verify API key
    const { authorized, organizationId: authOrgId } = await authorizeRequest(request);
    if (!authorized) {
      console.log("[Create Trip API] Unauthorized - invalid API key");
      return NextResponse.json(
        { error: "Unauthorized - invalid API key" },
        { status: 401 }
      );
    }

    const payload: CreateTripPayload = await request.json();
    const { visitorId, trip } = payload;

    console.log("[Create Trip API] Payload received:", { visitorId, tripId: trip?.id, tripName: trip?.name });

    if (!visitorId || !trip) {
      console.log("[Create Trip API] Missing required fields");
      return NextResponse.json(
        { error: "visitorId and trip are required" },
        { status: 400 }
      );
    }

    // Get visitor from chats table using session_id
    console.log("[Create Trip API] Looking up chat with session_id:", visitorId);
    const { data: chat, error: chatError } = await supabaseAdmin
      .from("chats")
      .select("visitor_id, organization_id")
      .eq("session_id", visitorId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log("[Create Trip API] Chat lookup result:", { chat, error: chatError });

    let visitor;
    let organizationId = authOrgId;

    if (chatError || !chat || !chat.visitor_id) {
      // No chat found - create a new visitor for this session with placeholder email
      console.log("[Create Trip API] No chat found, creating new visitor for session:", visitorId);

      // Use a placeholder email based on session ID (anonymous visitors)
      const placeholderEmail = `anonymous-${visitorId.substring(0, 8)}@concierge.local`;

      const { data: newVisitor, error: createVisitorError } = await supabaseAdmin
        .from("visitors")
        .insert({
          email: placeholderEmail,
          organization_id: authOrgId,
          source: 'trip_creation',
          last_active_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (createVisitorError || !newVisitor) {
        console.error("[Create Trip API] Failed to create visitor:", createVisitorError);
        return NextResponse.json(
          { error: "Failed to create visitor" },
          { status: 500 }
        );
      }

      visitor = newVisitor;
      organizationId = authOrgId;
      console.log("[Create Trip API] Created new visitor:", visitor.id, "with email:", placeholderEmail);
    } else {
      // Get visitor details from existing chat
      const { data: existingVisitor, error: visitorError } = await supabaseAdmin
        .from("visitors")
        .select("id")
        .eq("id", chat.visitor_id)
        .single();

      if (visitorError || !existingVisitor) {
        return NextResponse.json(
          { error: "Visitor details not found" },
          { status: 404 }
        );
      }

      visitor = existingVisitor;
      organizationId = chat.organization_id;
    }

    // Check if trip already exists (by trip.id which is the client-side UUID)
    const { data: existingTrip } = await supabaseAdmin
      .from("trips")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("visitor_id", visitor.id)
      .eq("id", trip.id)
      .single();

    let tripData;

    if (existingTrip) {
      // Update existing trip
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("trips")
        .update({
          name: trip.name,
          destination: trip.destination,
          start_date: trip.startDate || null,
          end_date: trip.endDate || null,
          days: trip.days || null,
          image_url: trip.image || null,
          updated_at: new Date(trip.updatedAt).toISOString(),
        })
        .eq("id", trip.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating trip:", updateError);
        return NextResponse.json(
          { error: "Failed to update trip" },
          { status: 500 }
        );
      }

      // Delete existing locations
      await supabaseAdmin
        .from("trip_locations")
        .delete()
        .eq("trip_id", trip.id);

      tripData = updated;
    } else {
      // Create new trip
      const { data: created, error: createError } = await supabaseAdmin
        .from("trips")
        .insert({
          id: trip.id, // Use client-provided UUID
          name: trip.name,
          destination: trip.destination,
          start_date: trip.startDate || null,
          end_date: trip.endDate || null,
          days: trip.days || null,
          image_url: trip.image || null,
          visitor_id: visitor.id,
          user_id: null,
          organization_id: organizationId,
          created_at: new Date(trip.createdAt).toISOString(),
          updated_at: new Date(trip.updatedAt).toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating trip:", createError);
        return NextResponse.json(
          { error: "Failed to create trip" },
          { status: 500 }
        );
      }

      tripData = created;
    }

    // Insert trip locations
    if (trip.locations && trip.locations.length > 0) {
      const locationInserts = trip.locations.map((loc) => ({
        trip_id: tripData.id,
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        description: loc.description || null,
        added_at: new Date(loc.addedAt).toISOString(),
      }));

      const { error: locationsError } = await supabaseAdmin
        .from("trip_locations")
        .insert(locationInserts);

      if (locationsError) {
        console.error("Error inserting trip locations:", locationsError);
        return NextResponse.json(
          { error: "Failed to save trip locations" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      tripId: tripData.id,
    });
  } catch (error) {
    console.error("Error in create trip endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
