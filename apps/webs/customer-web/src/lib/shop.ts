import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type { ShopResponse } from '@common/interfaces/models/shop';
import { cache } from 'react';
import { createServerApi } from './api';

// Public-facing shop info (BFF strips merchantId / credit / status).
export type ShopPublic = Omit<
  ShopResponse,
  'merchantId' | 'credit' | 'status'
>;

// Lấy chi tiết 1 shop theo id. Trả về null nếu BFF trả 404.
export const getShopById = cache(
  async (id: string): Promise<ShopPublic | null> => {
    const api = await createServerApi();
    const res = await api.get<ApiResponse<ShopPublic>>(`/shop/shop/${id}`, {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    });
    if (res.status === 404) return null;
    return res.data?.data ?? null;
  },
);
