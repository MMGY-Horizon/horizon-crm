import { NextRequest, NextResponse } from 'next/server';
import { getUserOrganization } from '@/lib/get-user-organization';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/users/[id]/views - Get user's article views
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
    const { id: userId } = await params;

    // First verify the user belongs to this organization
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.organization_id !== organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized - user does not belong to your organization' },
        { status: 403 }
      );
    }

    // Fetch user's article views
    const { data: views, error } = await supabaseAdmin
      .from('article_views')
      .select('id, article_id, article_name, article_type, viewed_at')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false });

    if (error) {
      console.error('Error fetching user views:', error);
      return NextResponse.json(
        { error: 'Failed to fetch views' },
        { status: 500 }
      );
    }

    return NextResponse.json({ views: views || [] });
  } catch (error: any) {
    console.error('Error in GET /api/users/[id]/views:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

