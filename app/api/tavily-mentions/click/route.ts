import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRequest } from '@/lib/api-auth';

// POST /api/tavily-mentions/click - Track when an article is clicked
export async function POST(request: NextRequest) {
  try {
    // Verify API key and get organization
    const auth = await authorizeRequest(request);
    if (!auth.authorized || !auth.organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { articleUrl, chatId, sessionId } = await request.json();

    if (!articleUrl) {
      return NextResponse.json(
        { error: 'Article URL is required' },
        { status: 400 }
      );
    }

    if (!sessionId && !chatId) {
      return NextResponse.json(
        { error: 'Session ID or Chat ID is required' },
        { status: 400 }
      );
    }

    // Find the most recent mention for this article in this session/chat and organization
    let query = supabaseAdmin
      .from('tavily_mentions')
      .select('*')
      .eq('article_url', articleUrl)
      .eq('organization_id', auth.organizationId)
      .order('mentioned_at', { ascending: false })
      .limit(1);

    if (chatId) {
      query = query.eq('chat_id', chatId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: mentions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching mention:', fetchError);
      return NextResponse.json(
        { error: 'Failed to find mention' },
        { status: 500 }
      );
    }

    if (!mentions || mentions.length === 0) {
      return NextResponse.json(
        { error: 'No mention found for this article' },
        { status: 404 }
      );
    }

    const mention = mentions[0];

    // Update the mention to mark it as clicked
    const { data, error: updateError } = await supabaseAdmin
      .from('tavily_mentions')
      .update({
        clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .eq('id', mention.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating mention:', updateError);
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mention: data
    });
  } catch (error: any) {
    console.error('Error in POST /api/tavily-mentions/click:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
