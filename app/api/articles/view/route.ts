import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.CRM_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { articleId, articleSlug, chatId, sessionId } = await request.json();

    if (!articleId || !articleSlug) {
      return NextResponse.json(
        { error: 'articleId and articleSlug are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('article_views')
      .insert({
        article_id: articleId,
        article_slug: articleSlug,
        chat_id: chatId || null,
        session_id: sessionId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting article view:', error);
      return NextResponse.json(
        { error: 'Failed to record article view' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      viewId: data.id,
    });
  } catch (error: any) {
    console.error('Error in article view API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

