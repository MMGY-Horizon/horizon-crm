import { NextRequest, NextResponse } from 'next/server';
import { getUserOrganization } from '@/lib/get-user-organization';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/analytics/interests - Get aggregated interests/preferences data
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
    // Get all visitors with metadata
    const { data: visitors, error } = await supabaseAdmin
      .from('visitors')
      .select('metadata')
      .eq('organization_id', organizationId)
      .not('metadata', 'is', null);

    if (error) {
      console.error('Error fetching visitor metadata:', error);
      return NextResponse.json(
        { error: 'Failed to fetch visitor data' },
        { status: 500 }
      );
    }

    // Aggregate interests data
    const seasonCounts = new Map<string, number>();
    const travelerTypeCounts = new Map<string, number>();
    const preferencesCounts = new Map<string, number>();
    const vibesCounts = new Map<string, number>();
    let totalVisitorsWithData = 0;

    for (const visitor of visitors || []) {
      const metadata = visitor.metadata;
      if (!metadata || typeof metadata !== 'object') continue;

      let hasData = false;

      // Count seasons
      if (metadata.season) {
        console.log('[Interests API] metadata.season:', metadata.season, 'Type:', typeof metadata.season);
        let seasonName: string | null;
        if (typeof metadata.season === 'string') {
          seasonName = metadata.season;
        } else if (metadata.season && typeof metadata.season === 'object') {
          seasonName = metadata.season?.name || metadata.season?.label || metadata.season?.value || null;
        } else {
          seasonName = null;
        }

        console.log('[Interests API] seasonName:', seasonName);

        // Only count valid string season names
        if (seasonName && typeof seasonName === 'string' && seasonName.trim() !== '') {
          seasonCounts.set(seasonName, (seasonCounts.get(seasonName) || 0) + 1);
          hasData = true;
        } else {
          console.log('[Interests API] Skipping invalid season:', metadata.season);
        }
      }

      // Count traveler types
      if (metadata.travelerType) {
        let travelerName: string | null;
        if (typeof metadata.travelerType === 'string') {
          travelerName = metadata.travelerType;
        } else if (metadata.travelerType && typeof metadata.travelerType === 'object') {
          travelerName = metadata.travelerType?.name || metadata.travelerType?.label || metadata.travelerType?.value || null;
        } else {
          travelerName = null;
        }

        // Only count valid string traveler types
        if (travelerName && typeof travelerName === 'string' && travelerName.trim() !== '') {
          travelerTypeCounts.set(travelerName, (travelerTypeCounts.get(travelerName) || 0) + 1);
          hasData = true;
        }
      }

      // Count preferences (array)
      if (Array.isArray(metadata.preferences)) {
        metadata.preferences.forEach((pref: string) => {
          if (pref) {
            preferencesCounts.set(pref, (preferencesCounts.get(pref) || 0) + 1);
            hasData = true;
          }
        });
      }

      // Count vibes (array)
      if (Array.isArray(metadata.vibes)) {
        metadata.vibes.forEach((vibe: string) => {
          if (vibe) {
            vibesCounts.set(vibe, (vibesCounts.get(vibe) || 0) + 1);
            hasData = true;
          }
        });
      }

      if (hasData) {
        totalVisitorsWithData++;
      }
    }

    // Convert maps to sorted arrays
    const seasons = Array.from(seasonCounts.entries())
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: totalVisitorsWithData > 0 ? ((count / totalVisitorsWithData) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);

    const travelerTypes = Array.from(travelerTypeCounts.entries())
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: totalVisitorsWithData > 0 ? ((count / totalVisitorsWithData) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);

    const preferences = Array.from(preferencesCounts.entries())
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: totalVisitorsWithData > 0 ? ((count / totalVisitorsWithData) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // Top 15 preferences

    const vibes = Array.from(vibesCounts.entries())
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: totalVisitorsWithData > 0 ? ((count / totalVisitorsWithData) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // Top 15 vibes

    return NextResponse.json({
      totalVisitors: totalVisitorsWithData,
      seasons,
      travelerTypes,
      preferences,
      vibes,
    });
  } catch (error: any) {
    console.error('Error in GET /api/analytics/interests:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
