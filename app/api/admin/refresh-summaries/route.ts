import { NextResponse } from 'next/server';

// Client-accessible endpoint for triggering chat summarization
// This proxies the request to the internal API with proper authentication
export async function POST() {
  try {
    const apiKey = process.env.CRM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'CRM_API_KEY not configured' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    
    const response = await fetch(`${baseUrl}/api/chats/summarize`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to refresh summaries' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error refreshing summaries:', error);
    return NextResponse.json(
      { error: 'Failed to refresh summaries', details: String(error) },
      { status: 500 }
    );
  }
}

