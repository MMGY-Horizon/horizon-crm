import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get organization settings (we'll always use visit-fort-myers slug for now)
    const { data: settings, error } = await supabaseAdmin
      .from('organization_settings')
      .select('*')
      .eq('slug', 'visit-fort-myers')
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization_name, location, website_url } = body;

    // Update organization settings
    const { data: settings, error } = await supabaseAdmin
      .from('organization_settings')
      .update({
        organization_name,
        location,
        website_url,
      })
      .eq('slug', 'visit-fort-myers')
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
