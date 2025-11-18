import { NextRequest, NextResponse } from 'next/server';
import { getUserOrganization } from '@/lib/get-user-organization';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/visitors - Get all visitors
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
    const { data: visitors, error } = await supabaseAdmin
      .from('visitors')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching visitors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch visitors' },
        { status: 500 }
      );
    }

    return NextResponse.json({ visitors: visitors || [] });
  } catch (error: any) {
    console.error('Error in GET /api/visitors:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

