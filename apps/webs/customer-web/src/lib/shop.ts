import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  MerchantResponse,
  PublicShopResponse,
} from '@common/interfaces/models/shop';
import { cache } from 'react';
import { createServerApi } from './api';

// Public-facing shop info (BFF strips merchantId / credit / status).
export type ShopPublic = PublicShopResponse;

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

const _getMyMerchantCached = cache(
  async (): Promise<MerchantResponse | null> => {
    const api = await createServerApi();
    const res = await api.get<ApiResponse<MerchantResponse>>(
      '/shop/merchant/me',
      {
        validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
      },
    );
    if (res.status === 404) return null;
    return res.data?.data ?? null;
  },
);

export function getMyMerchant(): Promise<MerchantResponse | null> {
  return _getMyMerchantCached();
}

export async function createMerchant(
  payload: Pick<MerchantResponse, 'type' | 'legalName' | 'taxCode'>,
): Promise<MerchantResponse> {
  const api = await createServerApi();
  const res = await api.post<ApiResponse<MerchantResponse>>(
    '/shop/merchant',
    payload,
  );
  return res.data.data;
}
