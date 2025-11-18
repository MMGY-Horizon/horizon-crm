import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/tavily-mentions - Log Tavily search results as mentions
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

    const { mentions, chatId, sessionId, visitorId, searchQuery } = await request.json();

    if (!mentions || !Array.isArray(mentions)) {
      return NextResponse.json(
        { error: 'Mentions array is required' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Insert all mentions
    const mentionsToInsert = mentions.map((mention) => ({
      article_url: mention.url,
      article_title: mention.title,
      article_type: 'tavily_search',
      chat_id: chatId || null,
      session_id: sessionId,
      visitor_id: visitorId || null,
      search_query: searchQuery || null,
      mentioned_at: new Date().toISOString(),
      clicked: false,
      metadata: {
        score: mention.score,
        content: mention.content?.substring(0, 500), // Store first 500 chars
        image: mention.image,
      },
    }));

    const { data, error } = await supabaseAdmin
      .from('tavily_mentions')
      .insert(mentionsToInsert)
      .select();

    if (error) {
      console.error('Error inserting tavily mentions:', error);
      return NextResponse.json(
        { error: 'Failed to log mentions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      mentions: data
    });
  } catch (error: any) {
    console.error('Error in POST /api/tavily-mentions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/tavily-mentions - Get all mentions with stats
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.url.split('?')[1];
    const params = new URLSearchParams(searchParams);
    const visitorId = params.get('visitorId');
    const chatId = params.get('chatId');

    let query = supabaseAdmin
      .from('tavily_mentions')
      .select('*')
      .order('mentioned_at', { ascending: false });

    if (visitorId) {
      query = query.eq('visitor_id', visitorId);
    }

    if (chatId) {
      query = query.eq('chat_id', chatId);
    }

    const { data: mentions, error } = await query;

    if (error) {
      console.error('Error fetching tavily mentions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch mentions' },
        { status: 500 }
      );
    }

    // Group by URL and count mentions/clicks
    const mentionStats = (mentions || []).reduce((acc: any, mention: any) => {
      const url = mention.article_url;

      if (!acc[url]) {
        acc[url] = {
          url,
          title: mention.article_title,
          type: mention.article_type,
          mentions: 0,
          clicks: 0,
          lastMentioned: mention.mentioned_at,
        };
      }

      acc[url].mentions += 1;
      if (mention.clicked) {
        acc[url].clicks += 1;
      }

      // Track most recent mention
      if (new Date(mention.mentioned_at) > new Date(acc[url].lastMentioned)) {
        acc[url].lastMentioned = mention.mentioned_at;
      }

      return acc;
    }, {});

    const stats = Object.values(mentionStats);

    return NextResponse.json({
      mentions: stats,
      total: stats.length
    });
  } catch (error: any) {
    console.error('Error in GET /api/tavily-mentions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
