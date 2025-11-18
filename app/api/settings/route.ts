import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { invalidateApiKeyCache } from '@/lib/api-auth';
import { getUserOrganization } from '@/lib/get-user-organization';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    // Get organization settings for user's organization
    const { data: settings, error } = await supabaseAdmin
      .from('organization_settings')
      .select('*')
      .eq('id', organizationId)
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

export async function POST(request: NextRequest) {
  // Get user's organization
  const organizationId = await getUserOrganization();

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Unauthorized - no organization found' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'regenerate_api_key') {
      // Regenerate API key using the database function
      const { data: result, error: regenerateError } = await supabaseAdmin
        .rpc('generate_api_key');

      if (regenerateError) {
        console.error('Error generating API key:', regenerateError);
        return NextResponse.json(
          { error: 'Failed to generate API key' },
          { status: 500 }
        );
      }

      const newApiKey = result;

      // Update the settings with the new API key
      const { data: settings, error: updateError } = await supabaseAdmin
        .from('organization_settings')
        .update({ api_key: newApiKey })
        .eq('id', organizationId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating API key:', updateError);
        return NextResponse.json(
          { error: 'Failed to update API key' },
          { status: 500 }
        );
      }

      // Invalidate the cache so the new API key takes effect immediately
      invalidateApiKeyCache();

      return NextResponse.json(settings);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Settings POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Get user's organization
  const organizationId = await getUserOrganization();

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Unauthorized - no organization found' },
      { status: 401 }
    );
  }

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
      .eq('id', organizationId)
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
