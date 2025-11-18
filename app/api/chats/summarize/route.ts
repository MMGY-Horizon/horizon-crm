import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeRequest } from '@/lib/api-auth';
import Groq from 'groq-sdk';

interface ChatSummary {
  topicSummary: string;
  userScore: number; // 1-5 (satisfaction)
  leadScore: number; // 0-10 (conversion potential)
  sentiment: string;
  topics: string[];
  conversionSignals: string[];
}

async function summarizeChat(messages: any[]): Promise<ChatSummary> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Format conversation for analysis
  const conversation = messages
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');

  const prompt = `Analyze this Fort Myers tourism chat for LEAD QUALITY and conversion potential:

LEAD SCORING (0-10):
- 10: Hot Lead - Ready to book (mentions dates, pricing, booking, availability, contact info)
- 7-9: Warm Lead - Active planning (specific logistics, multiple topics, group details, near-term travel)
- 4-6: Qualified - Research phase (2-3 questions, genuine interest, some context)
- 1-3: Cold - Just browsing (generic questions, no specifics, low engagement)
- 0: Unqualified (off-topic, testing, no travel intent)

KEY CONVERSION SIGNALS:
- Specific dates/timeframes mentioned
- Pricing/availability/booking questions
- Multiple detailed topics (hotels + dining + activities)
- Urgency indicators ("planning", "visiting soon", "next month")
- Group size/accommodation needs
- Transportation/logistics questions
- 4+ engaged messages

Also provide:
1. SHORT topic summary (max 10 words)
2. User satisfaction score (1-5) - how helpful was the conversation
3. Sentiment (positive, neutral, negative)
4. Key topics discussed (up to 3)
5. Conversion signals detected (list specific indicators found)

Conversation:
${conversation}

Respond in JSON format:
{
  "topicSummary": "Best family beaches and restaurants",
  "userScore": 4,
  "leadScore": 7,
  "sentiment": "positive",
  "topics": ["beaches", "restaurants", "family activities"],
  "conversionSignals": ["specific dates mentioned", "asked about group accommodations", "multiple topics"]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing customer service conversations. Provide concise, accurate analysis in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_completion_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const summary: ChatSummary = JSON.parse(response);
    
    // Validate scores
    summary.userScore = Math.max(1, Math.min(5, summary.userScore));
    summary.leadScore = Math.max(0, Math.min(10, summary.leadScore || 0));
    
    return summary;
  } catch (error) {
    console.error('AI summarization failed:', error);
    // Fallback to basic summary
    return {
      topicSummary: 'Conversation about Fort Myers travel',
      userScore: 3,
      leadScore: 3,
      sentiment: 'neutral',
      topics: ['general inquiry'],
      conversionSignals: [],
    };
  }
}

// POST /api/chats/summarize - Summarize a specific chat
export async function POST(request: NextRequest) {
  const auth = await authorizeRequest(request);
  if (!auth.authorized || !auth.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      );
    }

    // First verify the chat belongs to this organization
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .select('organization_id')
      .eq('chat_id', chatId)
      .single();

    if (chatError || !chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    if (chat.organization_id !== auth.organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized - chat does not belong to your organization' },
        { status: 403 }
      );
    }

    // Fetch chat messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages found for this chat' },
        { status: 404 }
      );
    }

    // Generate summary using AI
    const summary = await summarizeChat(messages);

    // Update chat metadata
    const { error: updateError } = await supabaseAdmin
      .from('chats')
      .update({
        metadata: {
          topicSummary: summary.topicSummary,
          userScore: summary.userScore,
          leadScore: summary.leadScore,
          sentiment: summary.sentiment,
          topics: summary.topics,
          conversionSignals: summary.conversionSignals,
          summarizedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('chat_id', chatId);

    if (updateError) {
      throw updateError;
    }

    console.log(`[CRM] Summarized chat ${chatId}:`, summary);

    return NextResponse.json({
      success: true,
      chatId,
      summary,
    });
  } catch (error) {
    console.error('[CRM] Chat summarization failed:', error);
    return NextResponse.json(
      { error: 'Failed to summarize chat', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/chats/summarize - Summarize all unsummarized chats or chats with new messages
export async function GET(request: NextRequest) {
  const auth = await authorizeRequest(request);
  if (!auth.authorized || !auth.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find all chats for this organization (we'll filter based on updated_at vs summarizedAt)
    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('chat_id, metadata, updated_at')
      .eq('organization_id', auth.organizationId)
      .limit(100); // Process up to 100 chats at a time

    if (chatsError) {
      throw chatsError;
    }

    if (!chats || chats.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No chats to summarize',
        summarizedCount: 0,
      });
    }

    // Filter chats that need summarization:
    // 1. Never been summarized (no topicSummary)
    // 2. Missing new fields (no leadScore or conversionSignals)
    // 3. Has new messages (updated_at > summarizedAt)
    const chatsToSummarize = chats.filter(chat => {
      const hasNoSummary = !chat.metadata?.topicSummary;
      const missingLeadScore = chat.metadata?.leadScore === undefined || chat.metadata?.leadScore === null;
      const missingConversionSignals = !chat.metadata?.conversionSignals;
      const summarizedAt = chat.metadata?.summarizedAt;
      const hasNewMessages = summarizedAt && new Date(chat.updated_at) > new Date(summarizedAt);
      
      return hasNoSummary || missingLeadScore || missingConversionSignals || hasNewMessages;
    });

    if (chatsToSummarize.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No chats need summarization (all up to date)',
        summarizedCount: 0,
        skippedCount: chats.length,
      });
    }

    console.log(`[CRM] Found ${chatsToSummarize.length} chats to summarize (${chats.length - chatsToSummarize.length} skipped - up to date)`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const chat of chatsToSummarize) {
      try {
        // Fetch messages for this chat
        const { data: messages } = await supabaseAdmin
          .from('messages')
          .select('*')
          .eq('chat_id', chat.chat_id)
          .order('created_at', { ascending: true });

        if (!messages || messages.length === 0) {
          console.log(`[CRM] Skipping chat ${chat.chat_id} - no messages`);
          continue;
        }

        // Generate summary
        const summary = await summarizeChat(messages);

        // Update chat
        await supabaseAdmin
          .from('chats')
          .update({
            metadata: {
              ...chat.metadata,
              topicSummary: summary.topicSummary,
              userScore: summary.userScore,
              leadScore: summary.leadScore,
              sentiment: summary.sentiment,
              topics: summary.topics,
              conversionSignals: summary.conversionSignals,
              summarizedAt: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('chat_id', chat.chat_id);

        results.push({
          chatId: chat.chat_id,
          success: true,
          summary: summary.topicSummary,
          score: summary.userScore,
        });
        successCount++;

        console.log(`[CRM] ✓ Summarized ${chat.chat_id}: "${summary.topicSummary}" (Score: ${summary.userScore})`);
      } catch (error) {
        console.error(`[CRM] Failed to summarize ${chat.chat_id}:`, error);
        results.push({
          chatId: chat.chat_id,
          success: false,
          error: String(error),
        });
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      totalProcessed: chatsToSummarize.length,
      totalSkipped: chats.length - chatsToSummarize.length,
      successCount,
      failCount,
      results,
    });
  } catch (error) {
    console.error('[CRM] Batch summarization failed:', error);
    return NextResponse.json(
      { error: 'Failed to summarize chats', details: String(error) },
      { status: 500 }
    );
  }
}

