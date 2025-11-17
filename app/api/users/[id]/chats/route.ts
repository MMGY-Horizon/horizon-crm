import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/users/[id]/chats - Get user's chats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    // Fetch user's chats with message count
    const { data: chats, error } = await supabaseAdmin
      .from('chats')
      .select(`
        id,
        created_at,
        topic_summary,
        leadScore,
        sentiment,
        messages:messages(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user chats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      );
    }

    // Transform the data to include message count
    const chatsWithCount = chats?.map(chat => ({
      ...chat,
      message_count: chat.messages?.[0]?.count || 0,
      messages: undefined, // Remove the nested messages object
    })) || [];

    return NextResponse.json({ chats: chatsWithCount });
  } catch (error: any) {
    console.error('Error in GET /api/users/[id]/chats:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

