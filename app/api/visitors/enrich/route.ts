import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserOrganization } from '@/lib/get-user-organization';
import { enrichVisitor } from '@/lib/apollo-enrichment';

// POST /api/visitors/enrich - Enrich all visitors that haven't been enriched yet
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

    // Get all visitors in this organization that haven't been enriched
    const { data: unenrichedVisitors, error: fetchError } = await supabaseAdmin
      .from('visitors')
      .select('id, email')
      .eq('organization_id', organizationId)
      .is('apollo_enriched_at', null)
      .not('email', 'is', null);

    if (fetchError) {
      console.error('Error fetching unenriched visitors:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch visitors' },
        { status: 500 }
      );
    }

    if (!unenrichedVisitors || unenrichedVisitors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No visitors need enrichment',
        enriched: 0,
        failed: 0,
        total: 0,
      });
    }

    // Enrich each visitor (with rate limiting consideration)
    const results = {
      enriched: 0,
      failed: 0,
      total: unenrichedVisitors.length,
    };

    // Process visitors sequentially to avoid rate limiting
    for (const visitor of unenrichedVisitors) {
      try {
        const success = await enrichVisitor(visitor.id, visitor.email);
        if (success) {
          results.enriched++;
        } else {
          results.failed++;
        }

        // Small delay to avoid rate limiting (100ms between requests)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error enriching visitor ${visitor.id}:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Enriched ${results.enriched} of ${results.total} visitors`,
      ...results,
    });
  } catch (error: any) {
    console.error('Error in POST /api/visitors/enrich:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
