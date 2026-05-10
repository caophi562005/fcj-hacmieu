import type {
  GetManyPromotionsResponse,
  GetPromotionResponse,
  PromotionResponse,
} from '@common/interfaces/models/promotion';
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import { createServerApi } from './api';

export async function getManyPromotions(query: {
  page?: number;
  limit?: number;
  code?: string;
  name?: string;
  status?: string;
} = {}): Promise<GetManyPromotionsResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyPromotionsResponse>>('/promotion/promotion', {
    params: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.code ? { code: query.code } : {}),
      ...(query.name ? { name: query.name } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
  });

  if (res.status === 404) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      promotions: [],
    };
  }

  return (
    res.data?.data ?? {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      promotions: [],
    }
  );
}

export async function getPromotionById(id: string): Promise<GetPromotionResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetPromotionResponse>>(`/promotion/promotion/${id}`, {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
  });

  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

export async function createPromotion(payload: {
  code: string;
  name: string;
  description?: string | null;
  status: string;
  startsAt: string;
  endsAt: string;
  scope: string;
  minOrderSubtotal: number;
  discountType: string;
  discountValue: number;
  maxDiscount?: number | null;
  totalLimit: number;
}): Promise<PromotionResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<PromotionResponse>>('/promotion/promotion', payload);
  if (!data?.data) throw new Error('Tạo promotion thất bại.');
  return data.data;
}

export async function updatePromotion(payload: {
  id: string;
  code?: string;
  name?: string;
  description?: string | null;
  status?: string;
  startsAt?: string;
  endsAt?: string;
  scope?: string;
  minOrderSubtotal?: number;
  discountType?: string;
  discountValue?: number;
  maxDiscount?: number | null;
  totalLimit?: number;
}): Promise<PromotionResponse> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<PromotionResponse>>('/promotion/promotion', payload);
  if (!data?.data) throw new Error('Cập nhật promotion thất bại.');
  return data.data;
}

export async function deletePromotion(id: string): Promise<void> {
  const api = await createServerApi();
  await api.delete(`/promotion/promotion/${id}`);
}
