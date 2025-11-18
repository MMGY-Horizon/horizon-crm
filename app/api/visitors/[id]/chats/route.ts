import { NextRequest, NextResponse } from 'next/server';
import { getUserOrganization } from '@/lib/get-user-organization';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/visitors/[id]/chats - Get visitor's chats
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
    const { id: visitorId } = await params;

    // First verify the visitor belongs to this organization
    const { data: visitor, error: visitorError } = await supabaseAdmin
      .from('visitors')
      .select('organization_id')
      .eq('id', visitorId)
      .single();

    if (visitorError || !visitor) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      );
    }

    if (visitor.organization_id !== organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized - visitor does not belong to your organization' },
        { status: 403 }
      );
    }

    // Fetch visitor's chats with message count (already filtered by organization via visitor check)
    const { data: chats, error } = await supabaseAdmin
      .from('chats')
      .select(`
        id,
        chat_id,
        created_at,
        metadata,
        messages:messages(count)
      `)
      .eq('visitor_id', visitorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching visitor chats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      );
    }

    // Transform the data to include message count and extract metadata fields
    const chatsWithCount = chats?.map(chat => ({
      id: chat.id,
      chat_id: chat.chat_id,
      created_at: chat.created_at,
      topic_summary: chat.metadata?.topicSummary || chat.metadata?.topic_summary || null,
      leadScore: chat.metadata?.leadScore || null,
      sentiment: chat.metadata?.sentiment || null,
      message_count: chat.messages?.[0]?.count || 0,
    })) || [];

    return NextResponse.json({ chats: chatsWithCount });
  } catch (error: any) {
    console.error('Error in GET /api/visitors/[id]/chats:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

