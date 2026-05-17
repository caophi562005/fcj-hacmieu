import { notFound } from 'next/navigation';
import { getVideo } from '../../../lib/video';
import { VideoDetailClient } from './_components/VideoDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Video ${id.slice(0, 8)}… — V-Shop Seller` };
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let video;
  try {
    video = await getVideo(id);
  } catch {
    notFound();
  }

  if (!video) notFound();

  return <VideoDetailClient video={video} />;
}
