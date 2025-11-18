import { NextRequest, NextResponse } from 'next/server';
import { getUserOrganization } from '@/lib/get-user-organization';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/users/[id]/chats - Get user's chats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Get user's organization
  const organizationId = await getUserOrganization();

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Unauthorized - no organization found' },
      { status: 401 }
    );
  }

  try {
    const { id: userId } = await params;

    // First verify the user belongs to this organization
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.organization_id !== organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized - user does not belong to your organization' },
        { status: 403 }
      );
    }

    // Fetch user's chats with message count (already filtered by organization via user check)
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

