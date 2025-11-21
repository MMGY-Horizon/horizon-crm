import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRequest } from '@/lib/api-auth';

// POST /api/article-mentions/click - Track article clicks
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

    const { articleUrl, sessionId, chatId } = await request.json();

    if (!articleUrl) {
      return NextResponse.json(
        { error: 'Article URL is required' },
        { status: 400 }
      );
    }

    // Build query to find matching mention
    let query = supabaseAdmin
      .from('article_mentions')
      .update({ clicked: true })
      .eq('article_url', articleUrl)
      .eq('organization_id', auth.organizationId);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    if (chatId) {
      query = query.eq('chat_id', chatId);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('Error updating article mention click:', error);
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: data?.length || 0
    });
  } catch (error: any) {
    console.error('Error in POST /api/article-mentions/click:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
