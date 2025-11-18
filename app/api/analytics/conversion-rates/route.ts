import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all chats (represents all sessions that started a chat)
    const { data: allChats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('chat_id, session_id');

    if (chatsError) {
      console.error('Error fetching chats:', chatsError);
      return NextResponse.json(
        { error: 'Failed to fetch chat data' },
        { status: 500 }
      );
    }

    const totalChats = allChats?.length || 0;
    const uniqueSessions = new Set(allChats?.map(c => c.session_id) || []).size;

    // Get chats with at least one user message (engaged users)
    const { data: messagesData, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('chat_id')
      .eq('role', 'user');

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

    const chatsWithMessages = new Set(messagesData?.map(m => m.chat_id) || []);
    const engagedChats = chatsWithMessages.size;

    // Get visitors (newsletter registrations)
    const { count: totalRegistrations, error: visitorsError } = await supabaseAdmin
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    if (visitorsError) {
      console.error('Error counting visitors:', visitorsError);
    }

    // Get article clicks (from tavily_mentions)
    const { data: clicksData, error: clicksError } = await supabaseAdmin
      .from('tavily_mentions')
      .select('chat_id, session_id')
      .eq('clicked', true);

    if (clicksError) {
      console.error('Error fetching clicks:', clicksError);
    }

    const totalArticleClicks = clicksData?.length || 0;
    const sessionsWithClicks = new Set(clicksData?.map(c => c.session_id).filter(Boolean) || []).size;
    const chatsWithClicks = new Set(clicksData?.map(c => c.chat_id).filter(Boolean) || []).size;

    // Get article views
    const { data: viewsData, error: viewsError } = await supabaseAdmin
      .from('article_views')
      .select('chat_id, session_id');

    if (viewsError) {
      console.error('Error fetching views:', viewsError);
    }

    const totalArticleViews = viewsData?.length || 0;
    const sessionsWithViews = new Set(viewsData?.map(v => v.session_id).filter(Boolean) || []).size;
    const chatsWithViews = new Set(viewsData?.map(v => v.chat_id).filter(Boolean) || []).size;

    // Calculate conversion rates
    const sessionToEngagement = totalChats > 0 ? ((engagedChats / totalChats) * 100).toFixed(1) : '0.0';
    const sessionToRegistration = uniqueSessions > 0 ? (((totalRegistrations || 0) / uniqueSessions) * 100).toFixed(1) : '0.0';
    const sessionToClick = uniqueSessions > 0 ? ((sessionsWithClicks / uniqueSessions) * 100).toFixed(1) : '0.0';
    const sessionToView = uniqueSessions > 0 ? ((sessionsWithViews / uniqueSessions) * 100).toFixed(1) : '0.0';
    const engagedToRegistration = engagedChats > 0 ? (((totalRegistrations || 0) / engagedChats) * 100).toFixed(1) : '0.0';
    const engagedToClick = engagedChats > 0 ? ((chatsWithClicks / engagedChats) * 100).toFixed(1) : '0.0';

    return NextResponse.json({
      // Session to Engagement funnel
      sessionToEngagement: {
        stages: [
          { label: 'Sessions Started', value: totalChats },
          { label: 'Sent Message', value: engagedChats },
        ],
        conversionRate: parseFloat(sessionToEngagement),
      },
      // Session to Registration funnel
      sessionToRegistration: {
        stages: [
          { label: 'Sessions Started', value: uniqueSessions },
          { label: 'Registered (Newsletter)', value: totalRegistrations || 0 },
        ],
        conversionRate: parseFloat(sessionToRegistration),
      },
      // Session to Article Click funnel
      sessionToClick: {
        stages: [
          { label: 'Sessions Started', value: uniqueSessions },
          { label: 'Clicked Article', value: sessionsWithClicks },
        ],
        conversionRate: parseFloat(sessionToClick),
      },
      // Session to Article View funnel
      sessionToView: {
        stages: [
          { label: 'Sessions Started', value: uniqueSessions },
          { label: 'Viewed Article Details', value: sessionsWithViews },
        ],
        conversionRate: parseFloat(sessionToView),
      },
      // Engaged to Registration funnel
      engagedToRegistration: {
        stages: [
          { label: 'Engaged Users', value: engagedChats },
          { label: 'Registered (Newsletter)', value: totalRegistrations || 0 },
        ],
        conversionRate: parseFloat(engagedToRegistration),
      },
      // Engaged to Article Click funnel
      engagedToClick: {
        stages: [
          { label: 'Engaged Users', value: engagedChats },
          { label: 'Clicked Article', value: chatsWithClicks },
        ],
        conversionRate: parseFloat(engagedToClick),
      },
    });
  } catch (error) {
    console.error('Conversion rates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
