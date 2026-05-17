'use client';

import type { VideoResponse } from '@common/interfaces/models/utility';
import { VideoCard as VideoCardBase } from '@common/web-ui/index';
import { toast } from 'react-toastify';
import { deleteVideoAction, updateVideoAction } from '../actions';

type Props = {
  video: VideoResponse;
};

export function VideoCard({ video }: Props) {
  return (
    <VideoCardBase
      video={video}
      href={`/videos/${video.id}`}
      onDelete={async (id) => deleteVideoAction(id)}
      onUpdate={async (id, payload) => updateVideoAction(id, payload)}
      toast={toast}
    />
  );
}
