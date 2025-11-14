import { NextRequest, NextResponse } from 'next/server';

// Vercel Cron Job - Automatically summarize unsummarized chats
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[CRON] Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[CRON] Starting chat summarization job...');

  try {
    // Call our internal summarize API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/chats/summarize`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.CRM_API_KEY || '',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Summarize API failed: ${error}`);
    }

    const result = await response.json();

    console.log('[CRON] Chat summarization completed:', {
      totalProcessed: result.totalProcessed,
      successCount: result.successCount,
      failCount: result.failCount,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('[CRON] Chat summarization failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

