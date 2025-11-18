import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserOrganization } from '@/lib/get-user-organization';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  // Get user's organization
  const organizationId = await getUserOrganization();

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Unauthorized - no organization found' },
      { status: 401 }
    );
  }

  try {
    // Get total chats for this organization
    const { count: totalChats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (chatsError) {
      console.error('Error counting chats:', chatsError);
    }

    // Get chat_ids for this organization
    const { data: orgChats } = await supabaseAdmin
      .from('chats')
      .select('chat_id')
      .eq('organization_id', organizationId);

    const chatIds = orgChats?.map(c => c.chat_id) || [];

    // Get total user messages for this organization's chats
    const { count: totalMessages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .in('chat_id', chatIds.length > 0 ? chatIds : ['']);

    if (messagesError) {
      console.error('Error counting messages:', messagesError);
    }

    // Get total visitors (registrations) for this organization
    const { count: totalVisitors, error: visitorsError } = await supabaseAdmin
      .from('visitors')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (visitorsError) {
      console.error('Error counting visitors:', visitorsError);
    }

    // Get total article clicks (from tavily_mentions) - skipping org filter for now
    const { count: totalArticleClicks, error: clicksError } = await supabaseAdmin
      .from('tavily_mentions')
      .select('*', { count: 'exact', head: true })
      .eq('clicked', true);

    if (clicksError) {
      console.error('Error counting article clicks:', clicksError);
    }

    // Get total article views for this organization
    const { count: totalArticleViews, error: viewsError } = await supabaseAdmin
      .from('article_views')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (viewsError) {
      console.error('Error counting article views:', viewsError);
    }

    // Get total places tracked (distinct article_ids from article_mentions and article_views)
    // Note: article_mentions doesn't have organization_id yet, so this will include all orgs
    const { data: mentionedArticles } = await supabaseAdmin
      .from('article_mentions')
      .select('article_id');

    const { data: viewedArticles } = await supabaseAdmin
      .from('article_views')
      .select('article_id')
      .eq('organization_id', organizationId);

    const uniqueArticles = new Set([
      ...(mentionedArticles?.map(a => a.article_id) || []),
      ...(viewedArticles?.map(a => a.article_id) || []),
    ]);

    // Get chats with at least one message (engaged users)
    // Messages are already filtered by chatIds which are from this organization
    const { data: chatsWithMessages } = await supabaseAdmin
      .from('messages')
      .select('chat_id')
      .eq('role', 'user')
      .in('chat_id', chatIds.length > 0 ? chatIds : ['']);

    const uniqueChatsWithMessages = new Set(chatsWithMessages?.map(m => m.chat_id) || []);

    // Get unique sessions (from chats) - already filtered by organization above
    const { data: sessions } = await supabaseAdmin
      .from('chats')
      .select('session_id')
      .eq('organization_id', organizationId);

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
