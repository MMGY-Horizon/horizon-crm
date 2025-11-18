import { supabaseAdmin } from './supabase';

// Cache the API key for 5 minutes to reduce database calls
let cachedApiKey: string | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getValidApiKey(): Promise<string | null> {
  const now = Date.now();

  // Return cached key if still valid
  if (cachedApiKey && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedApiKey;
  }

  // Fetch API key from database
  try {
    const { data, error } = await supabaseAdmin
      .from('organization_settings')
      .select('api_key')
      .eq('slug', 'visit-fort-myers')
      .single();

    if (error || !data) {
      console.error('Error fetching API key from database:', error);
      return null;
    }

    // Update cache
    cachedApiKey = data.api_key;
    cacheTimestamp = now;

    return cachedApiKey;
  } catch (error) {
    console.error('Error in getValidApiKey:', error);
    return null;
  }
}

export async function authorizeRequest(request: Request): Promise<boolean> {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return false;
  }

  const validApiKey = await getValidApiKey();

  if (!validApiKey) {
    console.error('No valid API key found in database');
    return false;
  }

  return apiKey === validApiKey;
}

// Function to invalidate the cache (call this after regenerating the API key)
export function invalidateApiKeyCache() {
  cachedApiKey = null;
  cacheTimestamp = 0;
}
