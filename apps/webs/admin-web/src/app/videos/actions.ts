'use server';

import { revalidatePath } from 'next/cache';
import {
  deleteVideo,
  getManyVideos,
  updateVideo,
  type UpdateVideoPayload,
} from '../../lib/video';

export type VideoMutationResult = {
  ok: boolean;
  message?: string;
};

function extractErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  const m = data?.message;
  if (Array.isArray(m)) return m.join(', ');
  if (typeof m === 'string') return m;
  return 'Đã xảy ra lỗi, vui lòng thử lại.';
}

export async function deleteVideoAction(
  id: string,
): Promise<VideoMutationResult> {
  try {
    await deleteVideo(id);
    revalidatePath('/videos');
    return { ok: true };
  } catch (err) {
    console.error('[deleteVideoAction]', err);
    return { ok: false, message: extractErrorMessage(err) };
  }
}

export async function updateVideoAction(
  id: string,
  payload: UpdateVideoPayload,
): Promise<VideoMutationResult> {
  try {
    await updateVideo(id, payload);
    revalidatePath('/videos');
    return { ok: true };
  } catch (err) {
    console.error('[updateVideoAction]', err);
    return { ok: false, message: extractErrorMessage(err) };
  }
}

export async function getVideosAction(params: {
  page?: number;
  limit?: number;
  shopId?: string;
  status?: string;
}) {
  return getManyVideos(params);
}
