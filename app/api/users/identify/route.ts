import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/users/identify - Identify/create user from newsletter signup
export async function POST(request: NextRequest) {
  try {
    const { email, session_id, chat_id, source } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: selectError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing user:', selectError);
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      );
    }

    let userId: string;

    if (existingUser) {
      // User exists, update last_sign_in_at
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
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }

      userId = updatedUser.id;
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
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      userId = newUser.id;
    }

    // Link session and chat to user if provided
    if (session_id || chat_id) {
      const updates = [];

      // Update chats table if chat_id provided
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
          .eq('session_id', session_id);

        if (viewUpdateError) {
          console.error('Error linking views to user:', viewUpdateError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      message: 'User identified successfully',
    });
  } catch (error: any) {
    console.error('Error in POST /api/users/identify:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

