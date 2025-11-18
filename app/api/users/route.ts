import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserOrganization } from '@/lib/get-user-organization';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/users - Fetch all users
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
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Add a new user (invite)
export async function POST(request: NextRequest) {
  try {
    // Get the logged-in user's organization
    const organizationId = await getUserOrganization();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized - no organization found' },
        { status: 401 }
      );
    }

    const { email, name, role } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists in this organization
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists in your organization' },
        { status: 409 }
      );
    }

    // Create new user with organization_id
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name: name || '',
        role: role || 'Member',
        provider: 'invite', // Mark as invited user
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // TODO: Send invitation email here
    console.log('User invited:', email);

    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

