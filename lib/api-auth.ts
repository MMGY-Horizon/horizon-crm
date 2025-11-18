import { supabaseAdmin } from './supabase';

// Cache the organization data for 5 minutes to reduce database calls
interface OrganizationCache {
  id: string;
  apiKey: string;
  slug: string;
}

let cachedOrgsByApiKey = new Map<string, OrganizationCache>();
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getOrganizationByApiKey(apiKey: string): Promise<OrganizationCache | null> {
  const now = Date.now();

  // Return cached org if still valid
  if (cachedOrgsByApiKey.has(apiKey) && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedOrgsByApiKey.get(apiKey)!;
  }

  // Fetch organization by API key from database
  try {
    const { data, error } = await supabaseAdmin
      .from('organization_settings')
      .select('id, api_key, slug')
      .eq('api_key', apiKey)
      .single();

    if (error || !data) {
      return null;
    }

    // Update cache
    const orgCache: OrganizationCache = {
      id: data.id,
      apiKey: data.api_key,
      slug: data.slug,
    };
    cachedOrgsByApiKey.set(apiKey, orgCache);
    cacheTimestamp = now;

    return orgCache;
  } catch (error) {
    console.error('Error in getOrganizationByApiKey:', error);
    return null;
  }
}

export async function authorizeRequest(request: Request): Promise<{ authorized: boolean; organizationId?: string }> {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return { authorized: false };
  }

  const org = await getOrganizationByApiKey(apiKey);

  if (!org) {
    console.error('No valid organization found for API key');
    return { authorized: false };
  }

  return { authorized: true, organizationId: org.id };
}

// Function to invalidate the cache (call this after regenerating the API key)
export function invalidateApiKeyCache() {
  cachedOrgsByApiKey.clear();
  cacheTimestamp = 0;
}
