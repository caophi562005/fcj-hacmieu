import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type { GetManyCartItemsResponse } from '@common/interfaces/models/order';
import { cache } from 'react';
import { createServerApi } from './api';

const EMPTY: GetManyCartItemsResponse = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 0,
  cartItems: [],
};

// `React.cache` per-request scope: trong 1 request chỉ có 1 user → 1 access token,
// nên không cần đưa accessToken vào cache key. Cache theo (page, limit) để các
// caller cùng (page, limit) chỉ gọi BFF 1 lần (Header dùng limit=1, CartPage
// dùng limit=20 → 2 entries riêng nhưng vẫn dedupe trong cùng render).
const _getMyCartCached = cache(
  async (
    page: number,
    limit: number,
  ): Promise<GetManyCartItemsResponse> => {
    const api = await createServerApi();
    const res = await api.get<ApiResponse<GetManyCartItemsResponse>>(
      '/order/cart',
      {
        params: { page, limit },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
      },
    );
    if (res.status === 404) return { ...EMPTY, page, limit };
    return res.data?.data ?? { ...EMPTY, page, limit };
  },
);

// Server-only fetch: lấy giỏ hàng (đã group theo shop) của user hiện tại.
export function getMyCart(
  query: { page?: number; limit?: number } = {},
): Promise<GetManyCartItemsResponse> {
  return _getMyCartCached(query.page ?? 1, query.limit ?? 20);
}
