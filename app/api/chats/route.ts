import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserOrganization } from '@/lib/get-user-organization';

export async function GET(request: NextRequest) {
  // Get user's organization
  const organizationId = await getUserOrganization();

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Unauthorized - no organization found' },
      { status: 401 }
    );
  }

  try {
    // Use a single query with aggregation to get chats and message counts
    // This is much faster than N+1 queries
    const { data: chats, error: chatsError } = await supabaseAdmin
      .rpc('get_chats_with_message_counts', { org_id: organizationId });

    if (chatsError) {
      console.error('Error fetching chats:', chatsError);

      // Fallback to old method if RPC doesn't exist yet
      const { data: fallbackChats, error: fallbackError } = await supabaseAdmin
        .from('chats')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        return NextResponse.json(
          { error: 'Failed to fetch chats' },
          { status: 500 }
        );
      }

      // Get all message counts in a single query
      const { data: messageCounts, error: countError } = await supabaseAdmin
        .from('messages')
        .select('chat_id');

      if (countError) {
        console.error('Error fetching message counts:', countError);
      }

      // Count messages per chat
      const countMap = new Map<string, number>();
      messageCounts?.forEach((msg) => {
        countMap.set(msg.chat_id, (countMap.get(msg.chat_id) || 0) + 1);
      });

      const chatsWithCounts = (fallbackChats || []).map((chat) => ({
        ...chat,
        message_count: countMap.get(chat.chat_id) || 0,
      }));

      return NextResponse.json(chatsWithCounts);
    }

    // RPC already filters by organization
    return NextResponse.json(chats || []);
  } catch (error) {
    console.error('Error in chats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
