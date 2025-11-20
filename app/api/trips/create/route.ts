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

    // Try to find visitor using multiple methods
    console.log("[Create Trip API] Looking up visitor for session_id:", visitorId);

    let visitor = null;
    let organizationId = authOrgId;
    let foundMethod = null;

    // Method 1: Check chats table
    const { data: chat, error: chatError } = await supabaseAdmin
      .from("chats")
      .select("visitor_id, organization_id")
      .eq("session_id", visitorId)
      .not("visitor_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!chatError && chat?.visitor_id) {
      const { data: existingVisitor } = await supabaseAdmin
        .from("visitors")
        .select("id")
        .eq("id", chat.visitor_id)
        .single();

      if (existingVisitor) {
        visitor = existingVisitor;
        organizationId = chat.organization_id;
        foundMethod = "chat";
        console.log("[Create Trip API] Found visitor via chat:", visitor.id);
      }
    }

    // Method 2: Check article_views table
    if (!visitor) {
      const { data: view, error: viewError } = await supabaseAdmin
        .from("article_views")
        .select("visitor_id")
        .eq("session_id", visitorId)
        .not("visitor_id", "is", null)
        .limit(1)
        .maybeSingle();

      if (!viewError && view?.visitor_id) {
        const { data: existingVisitor } = await supabaseAdmin
          .from("visitors")
          .select("id")
          .eq("id", view.visitor_id)
          .single();

        if (existingVisitor) {
          visitor = existingVisitor;
          foundMethod = "article_view";
          console.log("[Create Trip API] Found visitor via article_view:", visitor.id);
        }
      }
    }

    if (!visitor) {
      // No visitor found - create a new visitor for this session with placeholder email
      console.log("[Create Trip API] No visitor found, creating new visitor for session:", visitorId);

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
      foundMethod = "created";
      console.log("[Create Trip API] Created new visitor:", visitor.id, "with email:", placeholderEmail);
    }

    // Ensure there's a chat record linking this session to the visitor
    // This is important so future operations can find the visitor by session_id
    if (foundMethod !== "chat") {
      console.log("[Create Trip API] Creating chat record to link session to visitor");

      // Check if chat already exists for this session
      const { data: existingChat } = await supabaseAdmin
        .from("chats")
        .select("id")
        .eq("session_id", visitorId)
        .maybeSingle();

      if (!existingChat) {
        // Create new chat
        const { error: chatCreateError } = await supabaseAdmin
          .from("chats")
          .insert({
            session_id: visitorId,
            visitor_id: visitor.id,
            organization_id: organizationId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (chatCreateError) {
          console.error("[Create Trip API] Warning: Failed to create chat record:", chatCreateError);
          // Don't fail the request, just log the warning
        } else {
          console.log("[Create Trip API] Chat record created for session:", visitorId);
        }
      } else {
        // Update existing chat with visitor_id
        const { error: chatUpdateError } = await supabaseAdmin
          .from("chats")
          .update({ visitor_id: visitor.id })
          .eq("id", existingChat.id);

        if (chatUpdateError) {
          console.error("[Create Trip API] Warning: Failed to update chat record:", chatUpdateError);
        } else {
          console.log("[Create Trip API] Chat record updated for session:", visitorId);
        }
      }
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
        console.error("Trip data attempted:", JSON.stringify({
          id: trip.id,
          name: trip.name,
          destination: trip.destination,
          visitor_id: visitor.id,
          organization_id: organizationId,
        }));
        return NextResponse.json(
          { error: "Failed to create trip", details: createError.message, code: createError.code },
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
        latitude: loc.lat,
        longitude: loc.lng,
        description: loc.description || null,
        added_at: new Date(loc.addedAt).toISOString(),
      }));

      const { error: locationsError } = await supabaseAdmin
        .from("trip_locations")
        .insert(locationInserts);

      if (locationsError) {
        console.error("Error inserting trip locations:", locationsError);
        console.error("Locations data attempted:", JSON.stringify(locationInserts));
        return NextResponse.json(
          { error: "Failed to save trip locations", details: locationsError.message, code: locationsError.code },
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
