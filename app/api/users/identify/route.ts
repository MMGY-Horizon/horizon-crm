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

// POST /api/users/identify - Identify/create user from newsletter signup
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

    let existingUser = null;
    let selectError = null;
    let foundBySession = false;

    // First, check if a user already exists with this session_id
    // Check in chats table
    if (session_id) {
      const { data: sessionChat, error: chatError } = await supabaseAdmin
        .from('chats')
        .select('user_id')
        .eq('session_id', session_id)
        .not('user_id', 'is', null)
        .limit(1)
        .maybeSingle();

      if (!chatError && sessionChat?.user_id) {
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', sessionChat.user_id)
          .single();

        if (!userError && user) {
          existingUser = user;
          foundBySession = true;
        }
      }

      // If not found in chats, check article_views
      if (!existingUser) {
        const { data: sessionView, error: viewError } = await supabaseAdmin
          .from('article_views')
          .select('user_id')
          .eq('session_id', session_id)
          .not('user_id', 'is', null)
          .limit(1)
          .maybeSingle();

        if (!viewError && sessionView?.user_id) {
          const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', sessionView.user_id)
            .single();

          if (!userError && user) {
            existingUser = user;
            foundBySession = true;
          }
        }
      }

      // If found by session and email changed, update it
      if (existingUser && foundBySession && existingUser.email !== email) {
        console.log(`Updating email for session ${session_id}: ${existingUser.email} -> ${email}`);
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            email: email,
            last_sign_in_at: new Date().toISOString(),
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (!updateError) {
          existingUser = updatedUser;
        } else {
          console.error('Error updating user email:', updateError);
        }
      }
    }

    // If no user found by session, check by email
    if (!existingUser) {
      const result = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      existingUser = result.data;
      selectError = result.error;
    }

    if (selectError) {
      console.error('Error checking existing user:', selectError);
      const errorResponse = NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      );
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      return errorResponse;
    }

    let userId: string;

    if (existingUser) {
      // User exists - update last_sign_in_at if not already updated by session check
      if (foundBySession) {
        // Already updated in session check, just use the id
        userId = existingUser.id;
      } else {
        // Update last_sign_in_at for user found by email
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            last_sign_in_at: new Date().toISOString(),
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user:', updateError);
          const errorResponse = NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
          );
          errorResponse.headers.set('Access-Control-Allow-Origin', '*');
          return errorResponse;
        }

        userId = updatedUser.id;
      }
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          role: 'Visitor', // Default role for identified visitors
          provider: source || 'newsletter',
          last_sign_in_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        const errorResponse = NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
        errorResponse.headers.set('Access-Control-Allow-Origin', '*');
        return errorResponse;
      }

      userId = newUser.id;
    }

    // Link session and chat to user if provided
    if (session_id || chat_id) {
      // Update chats table for this session_id (links all chats from this session)
      if (session_id) {
        const { error: chatSessionUpdateError } = await supabaseAdmin
          .from('chats')
          .update({ user_id: userId })
          .eq('session_id', session_id)
          .is('user_id', null); // Only update if not already linked

        if (chatSessionUpdateError) {
          console.error('Error linking session chats to user:', chatSessionUpdateError);
        }
      }

      // Update specific chat if chat_id provided
      if (chat_id) {
        const { error: chatUpdateError } = await supabaseAdmin
          .from('chats')
          .update({ user_id: userId })
          .eq('id', chat_id);

        if (chatUpdateError) {
          console.error('Error linking chat to user:', chatUpdateError);
        }
      }

      // Update article_views table if session_id provided
      if (session_id) {
        const { error: viewUpdateError } = await supabaseAdmin
          .from('article_views')
          .update({ user_id: userId })
          .eq('session_id', session_id)
          .is('user_id', null); // Only update if not already linked

        if (viewUpdateError) {
          console.error('Error linking views to user:', viewUpdateError);
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      user_id: userId,
      message: 'User identified successfully',
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;
  } catch (error: any) {
    console.error('Error in POST /api/users/identify:', error);
    const errorResponse = NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
    
    // Add CORS headers
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return errorResponse;
  }
}

