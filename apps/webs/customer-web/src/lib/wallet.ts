import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetMyTransactionsResponse,
  WalletResponse,
} from '@common/interfaces/models/wallet';
import { cache } from 'react';
import { createServerApi } from './api';

const EMPTY_TX: GetMyTransactionsResponse = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  transactions: [],
};

const EMPTY_WALLET: WalletResponse = {
  id: '',
  userId: '',
  balance: 0,
  createdAt: null,
  updatedAt: null,
};

export const getMyWallet = cache(async (): Promise<WalletResponse> => {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<WalletResponse>>('/wallet/me', {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
  });
  if (res.status === 404) return EMPTY_WALLET;
  return res.data?.data ?? EMPTY_WALLET;
});

export type MyTransactionsQuery = {
  page?: number;
  limit?: number;
};

const _getMyTransactionsCached = cache(
  async (page: number, limit: number): Promise<GetMyTransactionsResponse> => {
    const api = await createServerApi();
    const res = await api.get<ApiResponse<GetMyTransactionsResponse>>(
      '/wallet/transactions',
      {
        params: { page, limit },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
      },
    );
    if (res.status === 404) return EMPTY_TX;
    return res.data?.data ?? EMPTY_TX;
  },
);

export function getMyTransactions(
  query: MyTransactionsQuery = {},
): Promise<GetMyTransactionsResponse> {
  return _getMyTransactionsCached(query.page ?? 1, query.limit ?? 20);
}
