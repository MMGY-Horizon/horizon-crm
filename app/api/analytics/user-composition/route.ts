import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserOrganization } from '@/lib/get-user-organization';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to parse user agent and determine device type
function getDeviceType(userAgent: string | null): 'Mobile' | 'Desktop' | 'Unknown' {
  if (!userAgent) return 'Unknown';

  const ua = userAgent.toLowerCase();

  // Check for mobile devices
  if (ua.includes('mobile') ||
      ua.includes('android') ||
      ua.includes('iphone') ||
      ua.includes('ipod') ||
      ua.includes('blackberry') ||
      ua.includes('windows phone')) {
    return 'Mobile';
  }

  // Check for tablets (count as mobile)
  if (ua.includes('ipad') || ua.includes('tablet')) {
    return 'Mobile';
  }

  // Default to desktop
  return 'Desktop';
}

// Helper function to normalize country names
function normalizeCountry(country: string): string {
  const normalized = country.toLowerCase().trim();

  // Map common variations to standard names
  const countryMap: Record<string, string> = {
    'us': 'United States',
    'usa': 'United States',
    'united states': 'United States',
    'united states of america': 'United States',
    'uk': 'United Kingdom',
    'great britain': 'United Kingdom',
    'united kingdom': 'United Kingdom',
  };

  return countryMap[normalized] || country;
}

// Helper function to check if location is valid
function isValidLocation(location: string): boolean {
  if (!location) return false;

  // Filter out IP addresses
  if (location.toLowerCase().includes('ip:')) return false;
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(location.trim())) return false;

  // Filter out other invalid patterns
  if (location.toLowerCase() === 'unknown') return false;
  if (location.toLowerCase() === 'n/a') return false;

  return true;
}

// Helper function to parse location and extract city/country
function parseLocation(location: string | null): { city: string | null; country: string | null } {
  if (!location || !isValidLocation(location)) {
    return { city: null, country: null };
  }

  // Location format is typically "City, State, Country" or similar
  const parts = location.split(',').map(p => p.trim());

  if (parts.length >= 1) {
    const city = parts[0];
    const rawCountry = parts[parts.length - 1];
    const country = normalizeCountry(rawCountry);
    return { city, country };
  }

  return { city: null, country: null };
}

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
    // Get all chats with location and user_agent data for this organization
    const { data: chats, error } = await supabaseAdmin
      .from('chats')
      .select('location, user_agent, created_at')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching chats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Process device type data
    const deviceCounts: Record<string, number> = {
      'Mobile': 0,
      'Desktop': 0,
      'Unknown': 0,
    };

    // Process location data
    const cityCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};

    chats?.forEach((chat) => {
      // Count devices
      const deviceType = getDeviceType(chat.user_agent);
      deviceCounts[deviceType]++;

      // Count locations
      const { city, country } = parseLocation(chat.location);
      if (city) {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
      if (country) {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });

    const totalChats = chats?.length || 0;

    // Format device data
    const deviceData = Object.entries(deviceCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalChats > 0 ? ((value / totalChats) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.value - a.value);

    // Format city data (top 15 cities + "Other")
    const sortedCities = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a);

    const topCities = sortedCities.slice(0, 15);
    const otherCitiesCount = sortedCities.slice(15).reduce((sum, [, count]) => sum + count, 0);

    const cityData = topCities.map(([name, value]) => ({
      name,
      value,
      percentage: totalChats > 0 ? ((value / totalChats) * 100).toFixed(1) : '0.0',
    }));

    if (otherCitiesCount > 0) {
      cityData.push({
        name: 'Other',
        value: otherCitiesCount,
        percentage: totalChats > 0 ? ((otherCitiesCount / totalChats) * 100).toFixed(1) : '0.0',
      });
    }

    // Format country data
    const countryData = Object.entries(countryCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalChats > 0 ? ((value / totalChats) * 100).toFixed(1) : '0.0',
      }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json({
      totalChats,
      devices: deviceData,
      cities: cityData,
      countries: countryData,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
