import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  CreditResponse,
  GetShopCreditTransactionsResponse,
} from '@common/interfaces/models/wallet';
import { cache } from 'react';
import { createServerApi } from './api';

export type SellerCreditTransactionsQuery = {
  page?: number;
  limit?: number;
  type?: string;
  source?: string;
};

const EMPTY_TRANSACTIONS: GetShopCreditTransactionsResponse = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  transactions: [],
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
