import type { OrderStatus } from '@common/constants/order.constant';
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetManyOrdersResponse,
  GetOrderResponse,
} from '@common/interfaces/models/order';
import { cache } from 'react';
import { createServerApi } from './api';

export type MyOrdersQuery = {
  page?: number;
  limit?: number;
  status?: OrderStatus | null;
};

const EMPTY: GetManyOrdersResponse = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  orders: [],
};

const _getMyOrdersCached = cache(
  async (
    page: number,
    limit: number,
    status: OrderStatus | null,
  ): Promise<GetManyOrdersResponse> => {
    const api = await createServerApi();
    const res = await api.get<ApiResponse<GetManyOrdersResponse>>('/order/order', {
      params: { page, limit, ...(status ? { status } : {}) },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    });

    if (res.status === 404) return { ...EMPTY, page, limit };
    return res.data?.data ?? { ...EMPTY, page, limit };
  },
);

export function getMyOrders(query: MyOrdersQuery = {}): Promise<GetManyOrdersResponse> {
  return _getMyOrdersCached(query.page ?? 1, query.limit ?? 10, query.status ?? null);
}

export const getMyOrderById = cache(
  async (orderId: string): Promise<GetOrderResponse | null> => {
    const api = await createServerApi();
    const res = await api.get<ApiResponse<GetOrderResponse>>(`/order/order/${orderId}`, {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    });

    if (res.status === 404) return null;
    return res.data?.data ?? null;
  },
);
