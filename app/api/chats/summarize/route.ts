import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Groq from 'groq-sdk';

// Verify API key authentication
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === process.env.CRM_API_KEY;
}

interface ChatSummary {
  topicSummary: string;
  userScore: number; // 1-5
  sentiment: string;
  topics: string[];
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

  const prompt = `Analyze this customer service chat conversation and provide:
1. A SHORT topic summary (max 10 words) - what was the main question/need?
2. A user satisfaction score (1-5) based on how well their needs were met
3. The overall sentiment (positive, neutral, negative)
4. Key topics discussed (up to 3 topics)

Conversation:
${conversation}

Respond in JSON format:
{
  "topicSummary": "short summary here",
  "userScore": 4,
  "sentiment": "positive",
  "topics": ["beaches", "restaurants"]
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
    
    // Validate score is between 1-5
    summary.userScore = Math.max(1, Math.min(5, summary.userScore));
    
    return summary;
  } catch (error) {
    console.error('AI summarization failed:', error);
    // Fallback to basic summary
    return {
      topicSummary: 'Conversation about Fort Myers travel',
      userScore: 3,
      sentiment: 'neutral',
      topics: ['general inquiry'],
    };
  }
}

// POST /api/chats/summarize - Summarize a specific chat
export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
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
          sentiment: summary.sentiment,
          topics: summary.topics,
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

// GET /api/chats/summarize - Summarize all unsummarized chats
export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find chats without topic summaries
    const { data: chats, error: chatsError } = await supabaseAdmin
      .from('chats')
      .select('chat_id, metadata')
      .or('metadata->topicSummary.is.null,metadata->topicSummary.eq.')
      .limit(50); // Process up to 50 chats at a time

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

    console.log(`[CRM] Found ${chats.length} chats to summarize`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const chat of chats) {
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
              sentiment: summary.sentiment,
              topics: summary.topics,
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
      totalProcessed: chats.length,
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

