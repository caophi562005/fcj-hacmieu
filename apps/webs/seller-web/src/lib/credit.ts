import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  CreateShopPayoutRequest,
  CreditResponse,
  GetShopCreditTransactionsResponse,
  GetShopPayoutsResponse,
  GetShopRevenueSummaryResponse,
  ShopPayoutResponse,
  UpdateShopPayoutStatusRequest,
} from '@common/interfaces/models/wallet';
import { cache } from 'react';
import { createServerApi } from './api';

export type SellerCreditTransactionsQuery = {
  page?: number;
  limit?: number;
  type?: string;
  source?: string;
};

export type SellerPayoutsQuery = {
  page?: number;
  limit?: number;
  status?: string;
};

export type CreatePayoutPayload = Omit<
  CreateShopPayoutRequest,
  'shopId' | 'processId'
>;
export type UpdatePayoutStatusPayload = Omit<
  UpdateShopPayoutStatusRequest,
  'shopId' | 'processId' | 'payoutId'
>;

const EMPTY_TRANSACTIONS: GetShopCreditTransactionsResponse = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  transactions: [],
};

const EMPTY_REVENUE_SUMMARY: GetShopRevenueSummaryResponse = {
  days: 7,
  totalRevenue: 0,
  points: [],
};

const EMPTY_PAYOUTS: GetShopPayoutsResponse = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  payouts: [],
};

function normalizeTransactionsResponse(
  data: GetShopCreditTransactionsResponse | null | undefined,
  page: number,
  limit: number,
): GetShopCreditTransactionsResponse {
  return {
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    totalItems: data?.totalItems ?? 0,
    totalPages: data?.totalPages ?? 0,
    transactions: Array.isArray(data?.transactions) ? data.transactions : [],
  };
}

const _getShopCreditCached = cache(async (): Promise<CreditResponse | null> => {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<CreditResponse>>('/wallet/credit/me', {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404 || s === 400,
  });

  if (res.status === 404 || res.status === 400) return null;
  return res.data?.data ?? null;
});

const _getShopCreditTransactionsCached = cache(
  async (
    page: number,
    limit: number,
    type: string | null,
    source: string | null,
  ): Promise<GetShopCreditTransactionsResponse> => {
    const api = await createServerApi();
    const res = await api.get<ApiResponse<GetShopCreditTransactionsResponse>>(
      '/wallet/credit/transactions',
      {
        params: {
          page,
          limit,
          ...(type ? { type } : {}),
          ...(source ? { source } : {}),
        },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
      },
    );

    if (res.status === 404) return { ...EMPTY_TRANSACTIONS, page, limit };
    return normalizeTransactionsResponse(res.data?.data, page, limit);
  },
);

const _getShopRevenueSummaryCached = cache(
  async (days: number): Promise<GetShopRevenueSummaryResponse> => {
    const api = await createServerApi();
    const res = await api.get<ApiResponse<GetShopRevenueSummaryResponse>>(
      '/wallet/credit/revenue-summary',
      {
        params: { days },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
      },
    );

    if (res.status === 404) {
      return { ...EMPTY_REVENUE_SUMMARY, days };
    }

    return {
      days: res.data?.data?.days ?? days,
      totalRevenue: res.data?.data?.totalRevenue ?? 0,
      points: Array.isArray(res.data?.data?.points) ? res.data.data.points : [],
    };
  },
);

export function getShopCredit(): Promise<CreditResponse | null> {
  return _getShopCreditCached();
}

export function getShopCreditTransactions(
  query: SellerCreditTransactionsQuery = {},
): Promise<GetShopCreditTransactionsResponse> {
  return _getShopCreditTransactionsCached(
    query.page ?? 1,
    query.limit ?? 10,
    query.type ?? null,
    query.source ?? null,
  );
}

export function getShopRevenueSummary(days = 7) {
  return _getShopRevenueSummaryCached(days);
}

export async function createShopPayout(
  payload: CreatePayoutPayload,
): Promise<ShopPayoutResponse> {
  const api = await createServerApi();
  const res = await api.post<ApiResponse<ShopPayoutResponse>>(
    '/wallet/payout/request',
    payload,
  );

  if (!res.data?.data) {
    throw new Error('Tạo yêu cầu rút tiền thất bại.');
  }

  return res.data.data;
}

export async function getShopPayoutById(payoutId: string) {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<ShopPayoutResponse>>(
    `/wallet/payout/${payoutId}`,
  );

  if (!res.data?.data) {
    throw new Error('Không tìm thấy yêu cầu rút tiền.');
  }

  return res.data.data;
}

export async function getShopPayouts(
  query: SellerPayoutsQuery = {},
): Promise<GetShopPayoutsResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetShopPayoutsResponse>>(
    '/wallet/payout',
    {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        ...(query.status ? { status: query.status } : {}),
      },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );

  if (res.status === 404) {
    return {
      ...EMPTY_PAYOUTS,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
  }

  return {
    page: res.data?.data?.page ?? query.page ?? 1,
    limit: res.data?.data?.limit ?? query.limit ?? 10,
    totalItems: res.data?.data?.totalItems ?? 0,
    totalPages: res.data?.data?.totalPages ?? 0,
    payouts: Array.isArray(res.data?.data?.payouts)
      ? res.data.data.payouts
      : [],
  };
}

export async function updateShopPayoutStatus(
  payoutId: string,
  payload: UpdatePayoutStatusPayload,
): Promise<ShopPayoutResponse> {
  const api = await createServerApi();
  const res = await api.patch<ApiResponse<ShopPayoutResponse>>(
    `/wallet/payout/${payoutId}/status`,
    payload,
  );

  if (!res.data?.data) {
    throw new Error('Cập nhật trạng thái rút tiền thất bại.');
  }

  return res.data.data;
}

export async function deleteShopPayout(
  payoutId: string,
): Promise<ShopPayoutResponse> {
  const api = await createServerApi();
  const res = await api.delete<ApiResponse<ShopPayoutResponse>>(
    `/wallet/payout/${payoutId}`,
  );

  if (!res.data?.data) {
    throw new Error('Huỷ yêu cầu rút tiền thất bại.');
  }

  return res.data.data;
}
