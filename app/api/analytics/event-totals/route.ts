import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserOrganization } from '@/lib/get-user-organization';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to get date range
function getDateRange(days: number = 90): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper to generate date labels for charts
function generateDateLabels(days: number = 90): string[] {
  const labels: string[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    labels.push(formatDate(date));
  }

  return labels;
}

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
    const days = 90; // Last 90 days
    const startDate = getDateRange(days);

    // First get chats for this organization
    const { data: orgChats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('chat_id')
      .eq('organization_id', organizationId);

    if (chatsError) {
      console.error('Error fetching chats:', chatsError);
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      );
    }

    const chatIds = orgChats?.map(c => c.chat_id) || [];

    // Get all user messages from the last 90 days for this org's chats
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('created_at, role')
      .eq('role', 'user')
      .in('chat_id', chatIds.length > 0 ? chatIds : [''])
      .gte('created_at', startDate.toISOString());

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch message data' },
        { status: 500 }
      );
    }

    // Get all article clicks from article_mentions (where clicked = true)
    const { data: articleClicks, error: clicksError } = await supabaseAdmin
      .from('article_mentions')
      .select('mentioned_at')
      .eq('clicked', true)
      .eq('organization_id', organizationId)
      .gte('mentioned_at', startDate.toISOString());

    if (clicksError) {
      console.error('Error fetching article clicks:', clicksError);
      return NextResponse.json(
        { error: 'Failed to fetch article clicks data' },
        { status: 500 }
      );
    }

    // Get all article views from the last 90 days for this organization
    const { data: articleViews, error: viewsError } = await supabaseAdmin
      .from('article_views')
      .select('viewed_at')
      .eq('organization_id', organizationId)
      .gte('viewed_at', startDate.toISOString());

    if (viewsError) {
      console.error('Error fetching article views:', viewsError);
      return NextResponse.json(
        { error: 'Failed to fetch article views data' },
        { status: 500 }
      );
    }

    // Generate date labels
    const dateLabels = generateDateLabels(days);

    // Process user chat messages per day
    const messagesByDate = new Map<string, number>();
    messages?.forEach((message) => {
      const date = formatDate(new Date(message.created_at));
      messagesByDate.set(date, (messagesByDate.get(date) || 0) + 1);
    });

    const chatMessagesData = dateLabels.map((date) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: messagesByDate.get(date) || 0,
    }));

    // Process article clicks per day (from article_mentions)
    const clicksByDate = new Map<string, number>();
    articleClicks?.forEach((click) => {
      const date = formatDate(new Date(click.mentioned_at));
      clicksByDate.set(date, (clicksByDate.get(date) || 0) + 1);
    });

    const articleClicksData = dateLabels.map((date) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: clicksByDate.get(date) || 0,
    }));

    // Process article views per day
    const viewsByDate = new Map<string, number>();
    articleViews?.forEach((view) => {
      const date = formatDate(new Date(view.viewed_at));
      viewsByDate.set(date, (viewsByDate.get(date) || 0) + 1);
    });

    const articleViewsData = dateLabels.map((date) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: viewsByDate.get(date) || 0,
    }));

    return NextResponse.json({
      chatMessages: chatMessagesData,
      articleClicks: articleClicksData,
      articleViews: articleViewsData,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
