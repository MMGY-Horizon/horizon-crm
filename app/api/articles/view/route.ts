import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('[Article View API] Received request');
    
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.CRM_API_KEY) {
      console.error('[Article View API] Unauthorized - Invalid API key');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { articleId, articleSlug, articleTitle, articleType, chatId, sessionId } = await request.json();
    console.log('[Article View API] Data:', { articleId, articleSlug, articleTitle, articleType, chatId, sessionId });

    if (!articleId || !articleSlug) {
      console.error('[Article View API] Missing required fields');
      return NextResponse.json(
        { error: 'articleId and articleSlug are required' },
        { status: 400 }
      );
    }

    console.log('[Article View API] Inserting into database...');
    const { data, error } = await supabaseAdmin
      .from('article_views')
      .insert({
        article_id: articleId,
        article_slug: articleSlug,
        article_name: articleTitle || articleSlug,
        article_type: articleType || 'Article',
        chat_id: chatId || null,
        session_id: sessionId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Article View API] Database error:', error);
      return NextResponse.json(
        { error: `Failed to record article view: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('[Article View API] Successfully recorded view:', data.id);
    return NextResponse.json({
      success: true,
      viewId: data.id,
    });
  } catch (error: any) {
    console.error('[Article View API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

