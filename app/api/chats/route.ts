import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Fetch all chats ordered by most recent
    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false });

    if (chatsError) {
      console.error('Error fetching chats:', chatsError);
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      );
    }

    // For each chat, get the message count
    const chatsWithCounts = await Promise.all(
      (chats || []).map(async (chat) => {
        const { count, error: countError } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.chat_id);

        return {
          ...chat,
          message_count: countError ? 0 : (count || 0)
        };
      })
    );

    return NextResponse.json(chatsWithCounts);
  } catch (error) {
    console.error('Error in chats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
