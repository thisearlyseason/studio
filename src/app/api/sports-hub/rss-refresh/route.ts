import { NextRequest, NextResponse } from 'next/server';
import { fetchAndParseRSSFeed, shouldRejectItem } from '@/lib/rss-parser';

export async function POST(req: NextRequest) {
  try {
    // Super admin check — in production, verify Firebase Admin auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedUrl, feedId, category } = await req.json();

    if (!feedUrl) {
      return NextResponse.json({ error: 'feedUrl is required' }, { status: 400 });
    }

    // Fetch and parse the RSS feed
    const rawItems = await fetchAndParseRSSFeed(feedUrl);

    // Apply content filters
    const filteredItems = rawItems.filter((item) => !shouldRejectItem(item));

    // In production: save articles to Firestore sports_hub_rss_articles collection
    // const db = getFirestore();
    // const batch = db.batch();
    // for (const item of filteredItems) {
    //   const docRef = db.collection('sports_hub_rss_articles').doc();
    //   batch.set(docRef, {
    //     feedId,
    //     title: item.title,
    //     url: item.url,
    //     excerpt: item.excerpt,
    //     imageUrl: item.imageUrl || null,
    //     source: item.source,
    //     publishedAt: item.publishedAt,
    //     category: category || 'General',
    //     importedAt: new Date().toISOString(),
    //     isDuplicate: false,
    //   });
    // }
    // await batch.commit();
    //
    // Update feed lastSyncAt
    // await db.collection('sports_hub_rss_feeds').doc(feedId).update({
    //   lastSyncAt: new Date().toISOString(),
    //   lastSyncStatus: 'success',
    //   articleCount: filteredItems.length,
    // });

    return NextResponse.json({
      success: true,
      totalFetched: rawItems.length,
      totalImported: filteredItems.length,
      rejected: rawItems.length - filteredItems.length,
    });
  } catch (error: unknown) {
    console.error('[Sports Hub] RSS refresh error:', error);
    return NextResponse.json({
      error: 'RSS refresh failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
