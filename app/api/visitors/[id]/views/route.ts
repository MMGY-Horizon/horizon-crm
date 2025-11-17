import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/visitors/[id]/views - Get visitor's article views
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: visitorId } = await params;

    // Fetch visitor's article views
    const { data: views, error } = await supabaseAdmin
      .from('article_views')
      .select('id, article_id, article_name, article_type, viewed_at')
      .eq('visitor_id', visitorId)
      .order('viewed_at', { ascending: false });

    if (error) {
      console.error('Error fetching visitor views:', error);
      return NextResponse.json(
        { error: 'Failed to fetch views' },
        { status: 500 }
      );
    }

    return NextResponse.json({ views: views || [] });
  } catch (error: any) {
    console.error('Error in GET /api/visitors/[id]/views:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

