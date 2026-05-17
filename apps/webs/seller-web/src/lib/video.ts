import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetManyVideosResponse,
  VideoResponse,
} from '@common/interfaces/models/utility';
import { createServerApi } from './api';

export type CreateVideoPayload = {
  shopId?: string;
  productId?: string;
};

export async function createVideo(
  payload: CreateVideoPayload,
): Promise<VideoResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<VideoResponse>>(
    '/utility/video',
    payload,
  );
  if (!data?.data) throw new Error('Tạo video thất bại.');
  return data.data;
}

export async function getManyVideos(params: {
  page?: number;
  limit?: number;
  shopId?: string;
  productId?: string;
  status?: string;
}): Promise<GetManyVideosResponse> {
  const api = await createServerApi();
  const { data } = await api.get<ApiResponse<GetManyVideosResponse>>(
    '/utility/video',
    { params },
  );
  if (!data?.data) throw new Error('Lấy danh sách video thất bại.');
  return data.data;
}

export async function getVideo(id: string): Promise<VideoResponse> {
  const api = await createServerApi();
  const { data } = await api.get<ApiResponse<VideoResponse>>(
    `/utility/video/${id}`,
  );
  if (!data?.data) throw new Error('Lấy video thất bại.');
  return data.data;
}

export async function deleteVideo(id: string): Promise<VideoResponse> {
  const api = await createServerApi();
  const { data } = await api.delete<ApiResponse<VideoResponse>>(
    `/utility/video/${id}`,
  );
  if (!data?.data) throw new Error('Xoá video thất bại.');
  return data.data;
}

export type UpdateVideoPayload = {
  productId?: string | null;
  isHidden?: boolean;
};

export async function updateVideo(
  id: string,
  payload: UpdateVideoPayload,
): Promise<VideoResponse> {
  const api = await createServerApi();
  const { data } = await api.patch<ApiResponse<VideoResponse>>(
    `/utility/video/${id}`,
    payload,
  );
  if (!data?.data) throw new Error('Cập nhật video thất bại.');
  return data.data;
}
