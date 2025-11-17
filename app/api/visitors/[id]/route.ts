import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/visitors/[id] - Get visitor details
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

    const { data: visitor, error } = await supabaseAdmin
      .from('visitors')
      .select('*')
      .eq('id', visitorId)
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

