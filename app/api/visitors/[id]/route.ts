import { NextRequest, NextResponse } from 'next/server';
import { getUserOrganization } from '@/lib/get-user-organization';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/visitors/[id] - Get visitor details
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

    const { data: visitor, error } = await supabaseAdmin
      .from('visitors')
      .select('*')
      .eq('id', visitorId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Error fetching visitor:', error);
      return NextResponse.json(
        { error: 'Failed to fetch visitor' },
        { status: 500 }
      );
    }

    return NextResponse.json({ visitor });
  } catch (error: any) {
    console.error('Error in GET /api/visitors/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

