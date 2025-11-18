import { NextRequest, NextResponse } from 'next/server';
import { getUserOrganization } from '@/lib/get-user-organization';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/visitors/[id]/views - Get visitor's article views
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Get user's organization
  const organizationId = await getUserOrganization();

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Unauthorized - no organization found' },
      { status: 401 }
    );
  }

  try {
    const { id: visitorId } = await params;

    // First verify the visitor belongs to this organization
    const { data: visitor, error: visitorError } = await supabaseAdmin
      .from('visitors')
      .select('organization_id')
      .eq('id', visitorId)
      .single();

    if (visitorError || !visitor) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      );
    }

    if (visitor.organization_id !== organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized - visitor does not belong to your organization' },
        { status: 403 }
      );
    }

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

