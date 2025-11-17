import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('[Article Stats API] Starting request...');
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30'; // days
    const typeFilter = searchParams.get('type');
    const searchQuery = searchParams.get('search');

    console.log('[Article Stats API] Params:', { dateRange, typeFilter, searchQuery });

    // Calculate date threshold
    const daysAgo = parseInt(dateRange);
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

    console.log('[Article Stats API] Querying mentions from:', dateThreshold.toISOString());

    // Build query for article mentions with date filter
    let mentionsQuery = supabaseAdmin
      .from('article_mentions')
      .select('article_id, article_name, article_slug, article_type')
      .gte('mentioned_at', dateThreshold.toISOString());

    if (typeFilter && typeFilter !== 'All types') {
      mentionsQuery = mentionsQuery.eq('article_type', typeFilter);
    }

    if (searchQuery) {
      mentionsQuery = mentionsQuery.or(
        `article_name.ilike.%${searchQuery}%,article_slug.ilike.%${searchQuery}%`
      );
    }

    const { data: mentions, error: mentionsError } = await mentionsQuery;

    if (mentionsError) {
      console.error('[Article Stats API] Error fetching article mentions:', mentionsError);
      return NextResponse.json(
        { error: `Failed to fetch article mentions: ${mentionsError.message}` },
        { status: 500 }
      );
    }

    console.log('[Article Stats API] Mentions fetched:', mentions?.length || 0);

    // Build query for article views with date filter
    let viewsQuery = supabaseAdmin
      .from('article_views')
      .select('article_id, article_slug, article_name, article_type')
      .gte('viewed_at', dateThreshold.toISOString());

    const { data: views, error: viewsError } = await viewsQuery;

    if (viewsError) {
      console.error('[Article Stats API] Error fetching article views:', viewsError);
      return NextResponse.json(
        { error: `Failed to fetch article views: ${viewsError.message}` },
        { status: 500 }
      );
    }

    console.log('[Article Stats API] Views fetched:', views?.length || 0);

    // Aggregate data by article
    const articleMap = new Map<string, any>();

    // Count mentions
    mentions?.forEach((mention) => {
      if (!articleMap.has(mention.article_id)) {
        articleMap.set(mention.article_id, {
          id: mention.article_id,
          name: mention.article_name,
          slug: mention.article_slug,
          type: mention.article_type || 'Article',
          mentions: 0,
          views: 0,
        });
      }
      const article = articleMap.get(mention.article_id);
      article.mentions++;
    });

    // Count views
    views?.forEach((view) => {
      if (articleMap.has(view.article_id)) {
        const article = articleMap.get(view.article_id);
        article.views++;
      } else {
        // Article has views but no mentions yet - add it to the map
        articleMap.set(view.article_id, {
          id: view.article_id,
          name: view.article_name || view.article_slug, // Use article_name or slug as fallback
          slug: view.article_slug,
          type: view.article_type || 'Article', // Use article_type or default
          mentions: 0,
          views: 1,
        });
      }
    });

    // Convert to array and sort by mentions
    const articles = Array.from(articleMap.values()).sort(
      (a, b) => b.mentions - a.mentions
    );

    // Calculate totals
    const totalMentioned = articles.reduce((sum, a) => sum + a.mentions, 0);
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

    console.log('[Article Stats API] Returning stats:', {
      articlesCount: articles.length,
      totalMentioned,
      totalViews,
    });

    return NextResponse.json({
      articles,
      totals: {
        totalMentioned,
        totalViews,
        uniqueArticles: articles.length,
      },
    });
  } catch (error: any) {
    console.error('[Article Stats API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

