import { notFound } from 'next/navigation';
import { getVideo, getVideoFeed } from '../../../lib/video';
import { VideoFeedClient } from '../_components/VideoFeedClient';

export const metadata = { title: 'Video — V-Shop' };

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    // 1. Lấy video chi tiết từ ID
    const video = await getVideo(id);

    // 2. Lấy thêm danh sách feed (loại trừ video hiện tại)
    const feed = await getVideoFeed({ limit: 10, excludeIds: [id] });
    
    // 3. Đưa video hiện tại lên đầu mảng
    const videos = [video, ...(feed.videos ?? [])];

    return <VideoFeedClient initialVideos={videos} />;
  } catch (err) {
    console.error('[VideoDetailPage]', err);
    notFound();
  }
}
