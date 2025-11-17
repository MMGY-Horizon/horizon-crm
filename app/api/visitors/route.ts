import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/visitors - Get all visitors
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: visitors, error } = await supabaseAdmin
      .from('visitors')
      .select('*')
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

