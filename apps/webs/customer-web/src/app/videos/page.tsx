import { getVideoFeed } from '../../lib/video';
import { VideoFeedClient } from './_components/VideoFeedClient';

export const metadata = { title: 'Video — V-Shop' };

export default async function VideosPage() {
  const data = await getVideoFeed({ limit: 10 });
  const videos = data.videos ?? [];

  return <VideoFeedClient initialVideos={videos} />;
}
