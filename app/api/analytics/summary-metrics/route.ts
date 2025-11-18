import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get total chats
    const { count: totalChats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('*', { count: 'exact', head: true });

    if (chatsError) {
      console.error('Error counting chats:', chatsError);
    }

    // Get total user messages
    const { count: totalMessages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    if (messagesError) {
      console.error('Error counting messages:', messagesError);
    }

    // Get total visitors (registrations)
    const { count: totalVisitors, error: visitorsError } = await supabaseAdmin
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    if (visitorsError) {
      console.error('Error counting visitors:', visitorsError);
    }

    // Get total article clicks (from tavily_mentions)
    const { count: totalArticleClicks, error: clicksError } = await supabaseAdmin
      .from('tavily_mentions')
      .select('*', { count: 'exact', head: true })
      .eq('clicked', true);

    if (clicksError) {
      console.error('Error counting article clicks:', clicksError);
    }

    // Get total article views
    const { count: totalArticleViews, error: viewsError } = await supabaseAdmin
      .from('article_views')
      .select('*', { count: 'exact', head: true });

    if (viewsError) {
      console.error('Error counting article views:', viewsError);
    }

    // Get total places tracked (distinct article_ids from article_mentions and article_views)
    const { data: mentionedArticles } = await supabaseAdmin
      .from('article_mentions')
      .select('article_id');

    const { data: viewedArticles } = await supabaseAdmin
      .from('article_views')
      .select('article_id');

    const uniqueArticles = new Set([
      ...(mentionedArticles?.map(a => a.article_id) || []),
      ...(viewedArticles?.map(a => a.article_id) || []),
    ]);

    // Get chats with at least one message (engaged users)
    const { data: chatsWithMessages } = await supabaseAdmin
      .from('messages')
      .select('chat_id')
      .eq('role', 'user');

    const uniqueChatsWithMessages = new Set(chatsWithMessages?.map(m => m.chat_id) || []);

    // Get unique sessions (from chats)
    const { data: sessions } = await supabaseAdmin
      .from('chats')
      .select('session_id');

    const uniqueSessions = new Set(sessions?.map(s => s.session_id) || []);

    return NextResponse.json({
      totalChats: totalChats || 0,
      totalMessages: totalMessages || 0,
      totalVisitors: totalVisitors || 0,
      totalArticleClicks: totalArticleClicks || 0,
      totalArticleViews: totalArticleViews || 0,
      totalPlacesTracked: uniqueArticles.size,
      engagedChats: uniqueChatsWithMessages.size,
      uniqueSessions: uniqueSessions.size,
    });
  } catch (error) {
    console.error('Summary metrics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
