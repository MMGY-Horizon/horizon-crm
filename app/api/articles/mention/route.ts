import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRequest } from '@/lib/api-auth';

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

    const { articles, chatId } = await request.json();

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json(
        { error: 'Articles array is required' },
        { status: 400 }
      );
    }

    // Insert all article mentions in batch with organization_id
    const mentions = articles.map((article: any) => ({
      article_id: article.id,
      article_name: article.title,
      article_slug: article.slug,
      article_type: article.type || 'Article',
      chat_id: chatId || null,
      organization_id: auth.organizationId,
    }));

    const { data, error } = await supabaseAdmin
      .from('article_mentions')
      .insert(mentions)
      .select();

    if (error) {
      console.error('Error inserting article mentions:', error);
      return NextResponse.json(
        { error: 'Failed to record article mentions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mentionsRecorded: data?.length || 0,
    });
  } catch (error: any) {
    console.error('Error in article mention API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

