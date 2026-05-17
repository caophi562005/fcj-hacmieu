import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetManyVideosResponse,
  VideoResponse,
} from '@common/interfaces/models/utility';
import { createServerApi } from './api';

export async function getVideoFeed(params: {
  limit?: number;
  excludeIds?: string[];
}): Promise<GetManyVideosResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<GetManyVideosResponse>>(
    '/utility/video/feed',
    { limit: params.limit || 10, excludeIds: params.excludeIds || [] },
  );
  if (!data?.data)
    return { page: 1, limit: 10, totalItems: 0, totalPages: 0, videos: [] };
  return data.data;
}

export async function getVideo(id: string): Promise<VideoResponse> {
  const api = await createServerApi();
  const { data } = await api.get<ApiResponse<VideoResponse>>(
    `/utility/video/${id}`,
  );
  if (!data?.data) throw new Error('Video not found');
  return data.data;
}
