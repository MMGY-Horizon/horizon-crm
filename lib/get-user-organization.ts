import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from './supabase';

/**
 * Get the organization ID for the currently logged-in user
 * Returns null if user is not authenticated or doesn't have an organization
 */
export async function getUserOrganization(): Promise<string | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('organization_id')
      .eq('email', session.user.email)
      .single();

    if (error || !data) {
      console.error('Error fetching user organization:', error);
      return null;
    }

    return data.organization_id;
  } catch (error) {
    console.error('Error in getUserOrganization:', error);
    return null;
  }
}
