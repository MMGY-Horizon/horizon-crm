import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserOrganization } from '@/lib/get-user-organization';

// POST /api/visitors/deduplicate - Find and merge duplicate visitor records
export async function POST(request: NextRequest) {
  try {
    // Get user's organization (must be authenticated)
    const organizationId = await getUserOrganization();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized - no organization found' },
        { status: 401 }
      );
    }

    console.log('[Deduplicate] Starting deduplication for organization:', organizationId);

    // Find all visitors with emails (excluding anonymous ones)
    const { data: visitors, error: fetchError } = await supabaseAdmin
      .from('visitors')
      .select('id, email, metadata, created_at, apollo_enriched_at')
      .eq('organization_id', organizationId)
      .not('email', 'is', null)
      .not('email', 'like', 'anonymous-%@concierge.local')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[Deduplicate] Error fetching visitors:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch visitors' },
        { status: 500 }
      );
    }

    if (!visitors || visitors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No visitors to deduplicate',
        merged: 0,
        total: 0,
      });
    }

    // Group visitors by email (case-insensitive)
    const emailGroups = new Map<string, typeof visitors>();

    for (const visitor of visitors) {
      const normalizedEmail = visitor.email.toLowerCase().trim();
      if (!emailGroups.has(normalizedEmail)) {
        emailGroups.set(normalizedEmail, []);
      }
      emailGroups.get(normalizedEmail)!.push(visitor);
    }

    // Process groups that have duplicates
    let mergedCount = 0;
    let deletedCount = 0;

    for (const [email, duplicates] of emailGroups.entries()) {
      if (duplicates.length <= 1) {
        continue; // Skip - no duplicates
      }

      console.log(`[Deduplicate] Found ${duplicates.length} duplicates for ${email}`);

      // Sort to keep the most valuable record:
      // 1. Prefer enriched records
      // 2. Prefer records with more metadata
      // 3. Prefer older records (created first)
      duplicates.sort((a, b) => {
        // Prefer enriched
        if (a.apollo_enriched_at && !b.apollo_enriched_at) return -1;
        if (!a.apollo_enriched_at && b.apollo_enriched_at) return 1;

        // Prefer more metadata
        const aMetadataSize = a.metadata ? Object.keys(a.metadata).length : 0;
        const bMetadataSize = b.metadata ? Object.keys(b.metadata).length : 0;
        if (aMetadataSize !== bMetadataSize) return bMetadataSize - aMetadataSize;

        // Prefer older
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      const canonical = duplicates[0];
      const toMerge = duplicates.slice(1);

      console.log(`[Deduplicate] Keeping ${canonical.id} and merging ${toMerge.length} duplicates`);

      // Merge metadata from all duplicates
      const mergedMetadata = { ...canonical.metadata };

      for (const duplicate of toMerge) {
        if (duplicate.metadata) {
          // Deep merge metadata - combine arrays, merge objects
          Object.keys(duplicate.metadata).forEach(key => {
            const canonicalValue = mergedMetadata[key];
            const duplicateValue = duplicate.metadata[key];

            if (Array.isArray(canonicalValue) && Array.isArray(duplicateValue)) {
              // Merge arrays and deduplicate
              mergedMetadata[key] = [...new Set([...canonicalValue, ...duplicateValue])];
            } else if (typeof canonicalValue === 'object' && typeof duplicateValue === 'object') {
              // Merge objects
              mergedMetadata[key] = { ...canonicalValue, ...duplicateValue };
            } else if (!canonicalValue && duplicateValue) {
              // Use duplicate value if canonical is empty
              mergedMetadata[key] = duplicateValue;
            }
          });
        }
      }

      // Update canonical record with merged metadata
      const { error: updateError } = await supabaseAdmin
        .from('visitors')
        .update({ metadata: mergedMetadata })
        .eq('id', canonical.id);

      if (updateError) {
        console.error(`[Deduplicate] Error updating canonical record ${canonical.id}:`, updateError);
        continue;
      }

      // Update foreign key references for duplicates (chats, views, trips)
      for (const duplicate of toMerge) {
        // Update chats
        const { error: chatsError } = await supabaseAdmin
          .from('chats')
          .update({ visitor_id: canonical.id })
          .eq('visitor_id', duplicate.id);

        if (chatsError) {
          console.error(`[Deduplicate] Error updating chats for ${duplicate.id}:`, chatsError);
        }

        // Update views
        const { error: viewsError } = await supabaseAdmin
          .from('views')
          .update({ visitor_id: canonical.id })
          .eq('visitor_id', duplicate.id);

        if (viewsError) {
          console.error(`[Deduplicate] Error updating views for ${duplicate.id}:`, viewsError);
        }

        // Update trips
        const { error: tripsError } = await supabaseAdmin
          .from('trips')
          .update({ visitor_id: canonical.id })
          .eq('visitor_id', duplicate.id);

        if (tripsError) {
          console.error(`[Deduplicate] Error updating trips for ${duplicate.id}:`, tripsError);
        }
      }

      // Delete duplicate records
      const duplicateIds = toMerge.map(d => d.id);
      const { error: deleteError } = await supabaseAdmin
        .from('visitors')
        .delete()
        .in('id', duplicateIds);

      if (deleteError) {
        console.error(`[Deduplicate] Error deleting duplicates:`, deleteError);
      } else {
        deletedCount += duplicateIds.length;
        mergedCount++;
      }
    }

    console.log(`[Deduplicate] Complete. Merged ${mergedCount} email groups, deleted ${deletedCount} duplicate records`);

    return NextResponse.json({
      success: true,
      message: `Merged ${mergedCount} email groups, deleted ${deletedCount} duplicate records`,
      merged: mergedCount,
      deleted: deletedCount,
      total: visitors.length,
    });
  } catch (error: any) {
    console.error('[Deduplicate] Error in POST /api/visitors/deduplicate:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
