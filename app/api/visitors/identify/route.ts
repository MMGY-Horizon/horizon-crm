import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// POST /api/visitors/identify - Identify/create visitor from newsletter signup
export async function POST(request: NextRequest) {
  try {
    const { email, session_id, chat_id, source } = await request.json();

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

    // First, check if a visitor already exists with this session_id
    // Check in chats table
    if (session_id) {
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

      // If found by session and email changed, update it
      if (existingVisitor && foundBySession && existingVisitor.email !== email) {
        console.log(`Updating email for session ${session_id}: ${existingVisitor.email} -> ${email}`);
        const { data: updatedVisitor, error: updateError } = await supabaseAdmin
          .from('visitors')
          .update({
            email: email,
            last_active_at: new Date().toISOString(),
          })
          .eq('id', existingVisitor.id)
          .select()
          .single();

        if (!updateError) {
          existingVisitor = updatedVisitor;
        } else {
          console.error('Error updating visitor email:', updateError);
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
        // Update last_active_at for visitor found by email
        const { data: updatedVisitor, error: updateError } = await supabaseAdmin
          .from('visitors')
          .update({
            last_active_at: new Date().toISOString(),
          })
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
      const { data: newVisitor, error: insertError } = await supabaseAdmin
        .from('visitors')
        .insert({
          email,
          source: source || 'newsletter',
          last_active_at: new Date().toISOString(),
        })
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
    }

    // Link session and chat to visitor if provided
    if (session_id || chat_id) {
      // Update chats table for this session_id (links all chats from this session)
      if (session_id) {
        const { error: chatSessionUpdateError } = await supabaseAdmin
          .from('chats')
          .update({ visitor_id: visitorId })
          .eq('session_id', session_id)
          .is('visitor_id', null); // Only update if not already linked

        if (chatSessionUpdateError) {
          console.error('Error linking session chats to visitor:', chatSessionUpdateError);
        }
      }

      // Update specific chat if chat_id provided
      if (chat_id) {
        const { error: chatUpdateError } = await supabaseAdmin
          .from('chats')
          .update({ visitor_id: visitorId })
          .eq('id', chat_id);

        if (chatUpdateError) {
          console.error('Error linking chat to visitor:', chatUpdateError);
        }
      }

      // Update article_views table if session_id provided
      if (session_id) {
        const { error: viewUpdateError } = await supabaseAdmin
          .from('article_views')
          .update({ visitor_id: visitorId })
          .eq('session_id', session_id)
          .is('visitor_id', null); // Only update if not already linked

        if (viewUpdateError) {
          console.error('Error linking views to visitor:', viewUpdateError);
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      visitor_id: visitorId,
      message: 'Visitor identified successfully',
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

