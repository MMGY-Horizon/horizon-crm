/**
 * Apollo.io Enrichment Service
 *
 * This service handles enriching visitor data with information from Apollo.io's
 * People Enrichment API.
 */

import { supabaseAdmin } from './supabase';

interface ApolloPersonData {
  person?: {
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    linkedin_url: string;
    title: string;
    email: string;
    organization?: {
      name: string;
      website_url: string;
      industry: string;
    };
    headline: string;
    country: string;
    state: string;
    city: string;
  };
}

interface EnrichmentResult {
  success: boolean;
  data?: ApolloPersonData;
  error?: string;
}

/**
 * Fetch enrichment data from Apollo.io for a given email
 */
export async function fetchApolloData(email: string): Promise<EnrichmentResult> {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    console.error('Apollo API key not configured');
    return {
      success: false,
      error: 'Apollo API key not configured',
    };
  }

  const url = `https://api.apollo.io/api/v1/people/match?email=${encodeURIComponent(email)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apollo API error:', response.status, errorText);
      return {
        success: false,
        error: `Apollo API returned ${response.status}: ${errorText}`,
      };
    }

    const data: ApolloPersonData = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Error fetching Apollo data:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Enrich a visitor with Apollo.io data
 * Only enriches if the visitor has never been enriched before (apollo_enriched_at is NULL)
 *
 * @param visitorId - The UUID of the visitor to enrich
 * @param email - The confirmed email address of the visitor
 * @returns True if enrichment was performed, false if skipped or failed
 */
export async function enrichVisitor(visitorId: string, email: string): Promise<boolean> {
  try {
    // Check if visitor has already been enriched
    const { data: visitor, error: fetchError } = await supabaseAdmin
      .from('visitors')
      .select('apollo_enriched_at')
      .eq('id', visitorId)
      .single();

    if (fetchError) {
      console.error('Error fetching visitor:', fetchError);
      return false;
    }

    // Skip if already enriched (only enrich on first save)
    if (visitor.apollo_enriched_at) {
      console.log(`Visitor ${visitorId} already enriched, skipping`);
      return false;
    }

    // Fetch data from Apollo
    const result = await fetchApolloData(email);

    // Update last_synced_at regardless of success
    const now = new Date().toISOString();

    if (!result.success || !result.data?.person) {
      console.log(`Apollo enrichment failed or no data for ${email}:`, result.error);

      // Update last_synced_at to track that we attempted enrichment
      await supabaseAdmin
        .from('visitors')
        .update({
          apollo_last_synced_at: now,
        })
        .eq('id', visitorId);

      return false;
    }

    const person = result.data.person;

    // Update visitor with Apollo data
    const { error: updateError } = await supabaseAdmin
      .from('visitors')
      .update({
        apollo_id: person.id,
        first_name: person.first_name,
        last_name: person.last_name,
        name: person.name || `${person.first_name} ${person.last_name}`.trim(),
        linkedin_url: person.linkedin_url,
        title: person.title,
        headline: person.headline,
        city: person.city,
        state: person.state,
        country: person.country,
        company_name: person.organization?.name,
        company_website: person.organization?.website_url,
        company_industry: person.organization?.industry,
        apollo_enriched_at: now,
        apollo_last_synced_at: now,
      })
      .eq('id', visitorId);

    if (updateError) {
      console.error('Error updating visitor with Apollo data:', updateError);
      return false;
    }

    console.log(`Successfully enriched visitor ${visitorId} with Apollo data`);
    return true;
  } catch (error) {
    console.error('Error in enrichVisitor:', error);
    return false;
  }
}

/**
 * Check if a visitor needs enrichment
 * Returns true if the visitor has never been enriched
 */
export async function needsEnrichment(visitorId: string): Promise<boolean> {
  try {
    const { data: visitor, error } = await supabaseAdmin
      .from('visitors')
      .select('apollo_enriched_at')
      .eq('id', visitorId)
      .single();

    if (error || !visitor) {
      return false;
    }

    return visitor.apollo_enriched_at === null;
  } catch (error) {
    console.error('Error checking enrichment status:', error);
    return false;
  }
}
