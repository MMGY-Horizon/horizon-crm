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

    // Get all chats from the last 90 days
    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('session_id, created_at')
      .gte('created_at', startDate.toISOString());

    if (chatsError) {
      console.error('Error fetching chats:', chatsError);
      return NextResponse.json(
        { error: 'Failed to fetch chat data' },
        { status: 500 }
      );
    }

    // Get all messages from the last 90 days (to count users who sent messages)
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('chat_id, created_at, role')
      .eq('role', 'user') // Only user messages
      .gte('created_at', startDate.toISOString());

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch message data' },
        { status: 500 }
      );
    }

    // Get chat_id to session_id mapping
    const chatToSession = new Map<string, string>();
    chats?.forEach((chat) => {
      chatToSession.set(chat.session_id, chat.session_id);
    });

    // Get all visitor registrations from the last 90 days
    const { data: visitors, error: visitorsError } = await supabaseAdmin
      .from('visitors')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    if (visitorsError) {
      console.error('Error fetching visitors:', visitorsError);
      return NextResponse.json(
        { error: 'Failed to fetch visitor data' },
        { status: 500 }
      );
    }

    // Generate date labels
    const dateLabels = generateDateLabels(days);

    // Process unique users (unique session_ids per day)
    const uniqueUsersByDate = new Map<string, Set<string>>();
    chats?.forEach((chat) => {
      const date = formatDate(new Date(chat.created_at));
      if (!uniqueUsersByDate.has(date)) {
        uniqueUsersByDate.set(date, new Set());
      }
      uniqueUsersByDate.get(date)!.add(chat.session_id);
    });

    const uniqueUsersData = dateLabels.map((date) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: uniqueUsersByDate.get(date)?.size || 0,
    }));

    // Process users who sent chat messages (unique session_ids from messages)
    const chatMessageUsersByDate = new Map<string, Set<string>>();

    // First, get chat_id to session_id mapping from all chats
    const chatIdToSessionId = new Map<string, string>();
    const { data: allChats } = await supabaseAdmin
      .from('chats')
      .select('chat_id, session_id');

    allChats?.forEach((chat) => {
      chatIdToSessionId.set(chat.chat_id, chat.session_id);
    });

    messages?.forEach((message) => {
      const date = formatDate(new Date(message.created_at));
      const sessionId = chatIdToSessionId.get(message.chat_id);

      if (sessionId) {
        if (!chatMessageUsersByDate.has(date)) {
          chatMessageUsersByDate.set(date, new Set());
        }
        chatMessageUsersByDate.get(date)!.add(sessionId);
      }
    });

    const chatMessageData = dateLabels.map((date) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: chatMessageUsersByDate.get(date)?.size || 0,
    }));

    // Process user registrations (visitors created per day)
    const registrationsByDate = new Map<string, number>();
    visitors?.forEach((visitor) => {
      const date = formatDate(new Date(visitor.created_at));
      registrationsByDate.set(date, (registrationsByDate.get(date) || 0) + 1);
    });

    const registrationData = dateLabels.map((date) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: registrationsByDate.get(date) || 0,
    }));

    return NextResponse.json({
      uniqueUsers: uniqueUsersData,
      chatMessages: chatMessageData,
      registrations: registrationData,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
