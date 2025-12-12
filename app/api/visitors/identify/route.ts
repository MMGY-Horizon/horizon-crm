import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRequest } from '@/lib/api-auth';
import { enrichVisitor } from '@/lib/apollo-enrichment';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}

// POST /api/visitors/identify - Identify/create visitor from newsletter signup
export async function POST(request: NextRequest) {
  // Authorize request and get organization ID
  const auth = await authorizeRequest(request);
  if (!auth.authorized || !auth.organizationId) {
    const errorResponse = NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }

  try {
    const { email, session_id, chat_id, source, visitor_id, metadata } = await request.json();

    console.log('[Identify API] Request received:', {
      email,
      session_id,
      chat_id,
      visitor_id,
      source,
      metadata
    });

    if (!email) {
      const errorResponse = NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      return errorResponse;
    }

    let existingVisitor = null;
    let selectError = null;
    let foundBySession = false;

    // Priority 1: Check if visitor_id is provided (from localStorage)
    if (visitor_id) {
      const { data: visitor, error: visitorError } = await supabaseAdmin
        .from('visitors')
        .select('*')
        .eq('id', visitor_id)
        .maybeSingle();

      if (!visitorError && visitor) {
        existingVisitor = visitor;
        foundBySession = true; // Treat as "found by session" since it's the same browsing session
        
        // Update email and metadata if changed
        const updateData: any = {
          last_active_at: new Date().toISOString(),
        };

        if (existingVisitor.email !== email) {
          console.log(`Updating email for visitor ${visitor_id}: ${existingVisitor.email} -> ${email}`);
          updateData.email = email;
        }

        // Merge metadata if provided
        if (metadata) {
          const existingMetadata = existingVisitor.metadata || {};
          updateData.metadata = { ...existingMetadata, ...metadata };
        }

        const { data: updatedVisitor, error: updateError } = await supabaseAdmin
          .from('visitors')
          .update(updateData)
          .eq('id', existingVisitor.id)
          .select()
          .single();

        if (!updateError) {
          existingVisitor = updatedVisitor;
        } else {
          console.error('Error updating visitor:', updateError);
        }
      }
    }

    // Priority 2: Check if a visitor already exists with this session_id
    // Check in chats table
    if (!existingVisitor && session_id) {
      const { data: sessionChat, error: chatError } = await supabaseAdmin
        .from('chats')
        .select('visitor_id')
        .eq('session_id', session_id)
        .not('visitor_id', 'is', null)
        .limit(1)
        .maybeSingle();

      if (!chatError && sessionChat?.visitor_id) {
        const { data: visitor, error: visitorError } = await supabaseAdmin
          .from('visitors')
          .select('*')
          .eq('id', sessionChat.visitor_id)
          .single();

        if (!visitorError && visitor) {
          existingVisitor = visitor;
          foundBySession = true;
        }
      }

      // If not found in chats, check article_views
      if (!existingVisitor) {
        const { data: sessionView, error: viewError } = await supabaseAdmin
          .from('article_views')
          .select('visitor_id')
          .eq('session_id', session_id)
          .not('visitor_id', 'is', null)
          .limit(1)
          .maybeSingle();

        if (!viewError && sessionView?.visitor_id) {
          const { data: visitor, error: visitorError } = await supabaseAdmin
            .from('visitors')
            .select('*')
            .eq('id', sessionView.visitor_id)
            .single();

          if (!visitorError && visitor) {
            existingVisitor = visitor;
            foundBySession = true;
          }
        }
      }

      // If found by session, update email and metadata if needed
      if (existingVisitor && foundBySession) {
        const updateData: any = {
          last_active_at: new Date().toISOString(),
        };

        if (existingVisitor.email !== email) {
          console.log(`Updating email for session ${session_id}: ${existingVisitor.email} -> ${email}`);
          updateData.email = email;
        }

        // Merge metadata if provided
        if (metadata) {
          const existingMetadata = existingVisitor.metadata || {};
          updateData.metadata = { ...existingMetadata, ...metadata };
        }

        const { data: updatedVisitor, error: updateError } = await supabaseAdmin
          .from('visitors')
          .update(updateData)
          .eq('id', existingVisitor.id)
          .select()
          .single();

        if (!updateError) {
          existingVisitor = updatedVisitor;
        } else {
          console.error('Error updating visitor:', updateError);
        }
      }
    }

    // If no visitor found by session, check by email
    if (!existingVisitor) {
      const result = await supabaseAdmin
        .from('visitors')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      existingVisitor = result.data;
      selectError = result.error;
    }

    if (selectError) {
      console.error('Error checking existing visitor:', selectError);
      const errorResponse = NextResponse.json(
        { error: 'Failed to check existing visitor' },
        { status: 500 }
      );
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      return errorResponse;
    }

    let visitorId: string;

    if (existingVisitor) {
      // Visitor exists - update last_active_at if not already updated by session check
      if (foundBySession) {
        // Already updated in session check, just use the id
        visitorId = existingVisitor.id;
      } else {
        // Update last_active_at and metadata for visitor found by email
        const updateData: any = {
          last_active_at: new Date().toISOString(),
        };

        // Merge metadata if provided
        if (metadata) {
          // If existing visitor has metadata, merge with new metadata
          const existingMetadata = existingVisitor.metadata || {};
          updateData.metadata = { ...existingMetadata, ...metadata };
        }

        const { data: updatedVisitor, error: updateError } = await supabaseAdmin
          .from('visitors')
          .update(updateData)
          .eq('id', existingVisitor.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating visitor:', updateError);
          const errorResponse = NextResponse.json(
            { error: 'Failed to update visitor' },
            { status: 500 }
          );
          errorResponse.headers.set('Access-Control-Allow-Origin', '*');
          return errorResponse;
        }

        visitorId = updatedVisitor.id;
      }
    } else {
      // Create new visitor
      const visitorData: any = {
        email,
        source: source || 'newsletter',
        last_active_at: new Date().toISOString(),
        organization_id: auth.organizationId,
      };

      // Add metadata if provided
      if (metadata) {
        visitorData.metadata = metadata;
      }

      const { data: newVisitor, error: insertError } = await supabaseAdmin
        .from('visitors')
        .insert(visitorData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating visitor:', insertError);
        const errorResponse = NextResponse.json(
          { error: 'Failed to create visitor' },
          { status: 500 }
        );
        errorResponse.headers.set('Access-Control-Allow-Origin', '*');
        return errorResponse;
      }

      visitorId = newVisitor.id;

      // Trigger Apollo enrichment for new visitor (async, don't wait)
      // This will only enrich if apollo_enriched_at is NULL
      enrichVisitor(visitorId, email).catch((error) => {
        console.error('Apollo enrichment error (non-blocking):', error);
      });
    }

    // Always link session and chat data to visitor when identified
    let linkedChatsCount = 0;
    let linkedViewsCount = 0;
    let linkedTripsCount = 0;

    // First, find any existing visitor_ids for this session before we update
    let oldVisitorIds: string[] = [];
    if (session_id) {
      const { data: existingChats } = await supabaseAdmin
        .from('chats')
        .select('visitor_id')
        .eq('session_id', session_id)
        .not('visitor_id', 'is', null);

      if (existingChats && existingChats.length > 0) {
        oldVisitorIds = [...new Set(existingChats.map(c => c.visitor_id).filter(Boolean))];
        console.log(`[Identify API] Found ${oldVisitorIds.length} existing visitor(s) for session: ${oldVisitorIds.join(', ')}`);
      }
    }

    // Update chats table for this session_id (links all chats from this session)
    if (session_id) {
      console.log(`[Identify API] Attempting to link chats with session_id: ${session_id} to visitor: ${visitorId}`);

      // Update ALL chats with this session_id, even if they already have a visitor_id
      // This handles the case where an anonymous visitor was created before identification
      const { data: linkedChats, error: chatSessionUpdateError } = await supabaseAdmin
        .from('chats')
        .update({ visitor_id: visitorId })
        .eq('session_id', session_id)
        .select('id');

      if (chatSessionUpdateError) {
        console.error('[Identify API] Error linking session chats to visitor:', chatSessionUpdateError);
      } else {
        linkedChatsCount = linkedChats?.length || 0;
        console.log(`[Identify API] Chat linking result: ${linkedChatsCount} chat(s) linked`, linkedChats);
        if (linkedChatsCount > 0) {
          console.log(`[Identify API] Successfully linked ${linkedChatsCount} chat(s) to visitor ${visitorId}`);
        } else {
          console.log(`[Identify API] No chats found to link for session_id: ${session_id}`);
        }
      }
    } else {
      console.log('[Identify API] No session_id provided, skipping chat linking');
    }

    // Update specific chat if chat_id provided
    if (chat_id) {
      const { error: chatUpdateError } = await supabaseAdmin
        .from('chats')
        .update({ visitor_id: visitorId })
        .eq('id', chat_id);

      if (chatUpdateError) {
        console.error('Error linking chat to visitor:', chatUpdateError);
      } else {
        console.log(`Linked specific chat ${chat_id} to visitor ${visitorId}`);
      }
    }

    // Update article_views table if session_id provided
    if (session_id) {
      const { data: linkedViews, error: viewUpdateError } = await supabaseAdmin
        .from('article_views')
        .update({ visitor_id: visitorId })
        .eq('session_id', session_id)
        .is('visitor_id', null) // Only update if not already linked
        .select('id');

      if (viewUpdateError) {
        console.error('Error linking views to visitor:', viewUpdateError);
      } else {
        linkedViewsCount = linkedViews?.length || 0;
        if (linkedViewsCount > 0) {
          console.log(`Linked ${linkedViewsCount} view(s) to visitor ${visitorId}`);
        }
      }
    }

    // Migrate trips from old anonymous visitors to the identified visitor
    if (oldVisitorIds.length > 0 && !oldVisitorIds.includes(visitorId)) {
      console.log(`[Identify API] Migrating trips from anonymous visitor(s) to ${visitorId}`);

      const { data: migratedTrips, error: tripMigrateError } = await supabaseAdmin
        .from('trips')
        .update({ visitor_id: visitorId })
        .in('visitor_id', oldVisitorIds)
        .eq('organization_id', auth.organizationId)
        .select('id');

      if (tripMigrateError) {
        console.error('[Identify API] Error migrating trips:', tripMigrateError);
      } else {
        linkedTripsCount = migratedTrips?.length || 0;
        if (linkedTripsCount > 0) {
          console.log(`[Identify API] Successfully migrated ${linkedTripsCount} trip(s) to visitor ${visitorId}`);
        } else {
          console.log(`[Identify API] No trips found to migrate from anonymous visitor(s)`);
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      visitor_id: visitorId,
      message: 'Visitor identified successfully',
      linked: {
        chats: linkedChatsCount,
        views: linkedViewsCount,
        trips: linkedTripsCount,
      },
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;
  } catch (error: any) {
    console.error('Error in POST /api/visitors/identify:', error);
    const errorResponse = NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
    
    // Add CORS headers
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return errorResponse;
  }
}

