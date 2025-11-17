import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30'; // days
    const typeFilter = searchParams.get('type');
    const searchQuery = searchParams.get('search');

    // Calculate date threshold
    const daysAgo = parseInt(dateRange);
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

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
      console.error('Error fetching article mentions:', mentionsError);
      return NextResponse.json(
        { error: 'Failed to fetch article stats' },
        { status: 500 }
      );
    }

    // Build query for article views with date filter
    let viewsQuery = supabaseAdmin
      .from('article_views')
      .select('article_id')
      .gte('viewed_at', dateThreshold.toISOString());

    const { data: views, error: viewsError } = await viewsQuery;

    if (viewsError) {
      console.error('Error fetching article views:', viewsError);
      return NextResponse.json(
        { error: 'Failed to fetch article stats' },
        { status: 500 }
      );
    }

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
      }
    });

    // Convert to array and sort by mentions
    const articles = Array.from(articleMap.values()).sort(
      (a, b) => b.mentions - a.mentions
    );

    // Calculate totals
    const totalMentioned = articles.reduce((sum, a) => sum + a.mentions, 0);
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

    return NextResponse.json({
      articles,
      totals: {
        totalMentioned,
        totalViews,
        uniqueArticles: articles.length,
      },
    });
  } catch (error: any) {
    console.error('Error in article stats API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

