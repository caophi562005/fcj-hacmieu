'use client';

import type { VideoResponse } from '@common/interfaces/models/utility';
import { VideoPlayer } from '@common/web-ui/index';
import { useRouter } from 'next/navigation';

type Props = {
  video: VideoResponse;
};

export function VideoDetailClient({ video }: Props) {
  const router = useRouter();

  if (video.status !== 'READY' || !video.hlsUrl) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-ink-muted">
        Video chưa sẵn sàng để xem.
      </div>
    );
  }

  return (
    <VideoPlayer
      src={video.hlsUrl}
      poster={video.thumbnailUrl}
      onClose={() => router.back()}
    />
  );
}
