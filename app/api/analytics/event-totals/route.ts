import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
  try {
    const days = 90; // Last 90 days
    const startDate = getDateRange(days);

    // Get all user messages from the last 90 days
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('created_at, role')
      .eq('role', 'user')
      .gte('created_at', startDate.toISOString());

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch message data' },
        { status: 500 }
      );
    }

    // Get all article clicks from tavily_mentions (where clicked = true)
    const { data: tavilyClicks, error: tavilyError } = await supabaseAdmin
      .from('tavily_mentions')
      .select('clicked_at')
      .eq('clicked', true)
      .gte('clicked_at', startDate.toISOString());

    if (tavilyError) {
      console.error('Error fetching tavily clicks:', tavilyError);
      return NextResponse.json(
        { error: 'Failed to fetch tavily clicks data' },
        { status: 500 }
      );
    }

    // Get all article views from the last 90 days
    const { data: articleViews, error: viewsError } = await supabaseAdmin
      .from('article_views')
      .select('viewed_at')
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

    // Process article clicks per day (from tavily_mentions)
    const clicksByDate = new Map<string, number>();
    tavilyClicks?.forEach((click) => {
      const date = formatDate(new Date(click.clicked_at));
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
