import { NextRequest, NextResponse } from 'next/server';
import { getVideoFeed } from '../../../lib/video';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await getVideoFeed({
      limit: body.limit || 5,
      excludeIds: body.excludeIds || [],
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/video-feed]', err);
    return NextResponse.json({ videos: [], totalItems: 0 }, { status: 500 });
  }
}
