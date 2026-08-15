import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetManyMerchantsResponse,
  GetManyShopsResponse,
  MerchantResponse,
  ShopResponse,
} from '@common/interfaces/models/shop';
import type {
  GetShopPayoutsResponse,
  ShopPayoutResponse,
} from '@common/interfaces/models/wallet';
import { createServerApi } from './api';

export async function getManyMerchants(
  query: {
    page?: number;
    limit?: number;
    legalName?: string;
    approvalStatus?: string;
    type?: 'INDIVIDUAL' | 'BUSINESS';
  } = {},
): Promise<GetManyMerchantsResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyMerchantsResponse>>(
    '/shop/merchant',
    {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        ...(query.legalName ? { legalName: query.legalName } : {}),
        ...(query.approvalStatus
          ? { approvalStatus: query.approvalStatus }
          : {}),
        ...(query.type ? { type: query.type } : {}),
      },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );

  if (res.status === 404) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      merchants: [],
    };
  }

  return (
    res.data?.data ?? {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      merchants: [],
    }
  );
}

export async function getMerchantById(
  id: string,
): Promise<MerchantResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<MerchantResponse>>(
    `/shop/merchant/${id}`,
    {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

export async function updateMerchant(payload: {
  id: string;
  approvalStatus?: string;
  canSell?: boolean;
  legalName?: string;
  taxCode?: string | null;
  type?: 'INDIVIDUAL' | 'BUSINESS';
}): Promise<MerchantResponse> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<MerchantResponse>>(
    '/shop/merchant',
    payload,
  );
  if (!data?.data) throw new Error('Cập nhật merchant thất bại.');
  return data.data;
}

export async function getManyShops(
  query: {
    page?: number;
    limit?: number;
    name?: string;
    status?: string;
  } = {},
): Promise<GetManyShopsResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyShopsResponse>>('/shop/shop', {
    params: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
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
      shops: [],
    };
  }

  return (
    res.data?.data ?? {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      shops: [],
    }
  );
}

export async function getShopById(id: string): Promise<ShopResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<ShopResponse>>(`/shop/shop/${id}`, {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
  });
  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

export async function updateShop(payload: {
  id: string;
  merchantId?: string;
  name?: string;
  description?: string;
  status?: string;
  logo?: string | null;
  banner?: string | null;
  phone?: string | null;
  pickupAddress?: string | null;
  returnAddress?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankCode?: string | null;
  bankAccountName?: string | null;
}): Promise<ShopResponse> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<ShopResponse>>(
    '/shop/shop',
    payload,
  );
  if (!data?.data) throw new Error('Cập nhật shop thất bại.');
  return data.data;
}

export async function getManyPayouts(
  query: {
    page?: number;
    limit?: number;
    status?: string;
    shopId?: string;
  } = {},
): Promise<GetShopPayoutsResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetShopPayoutsResponse>>(
    '/wallet/payout',
    {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        ...(query.status ? { status: query.status } : {}),
        ...(query.shopId ? { shopId: query.shopId } : {}),
      },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );

  if (res.status === 404) {
    return {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      payouts: [],
    };
  }

  const raw = res.data?.data as Partial<GetShopPayoutsResponse> | undefined;

  return raw && typeof raw === 'object'
    ? {
        page: raw.page ?? query.page ?? 1,
        limit: raw.limit ?? query.limit ?? 10,
        totalItems: raw.totalItems ?? 0,
        totalPages: raw.totalPages ?? 0,
        payouts: Array.isArray(raw.payouts) ? raw.payouts : [],
      }
    : {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        totalItems: 0,
        totalPages: 0,
        payouts: [],
      };
}

export async function getPayoutById(
  shopId: string,
  payoutId: string,
): Promise<ShopPayoutResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<ShopPayoutResponse>>(
    `/wallet/payout/${shopId}/${payoutId}`,
    {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

export async function updatePayoutStatus(payload: {
  shopId: string;
  payoutId: string;
  status: 'PENDING' | 'TRANSFERRED' | 'REJECTED';
}): Promise<ShopPayoutResponse> {
  const api = await createServerApi();
  const { data } = await api.patch<ApiResponse<ShopPayoutResponse>>(
    `/wallet/payout/${payload.shopId}/${payload.payoutId}/status`,
    { status: payload.status },
  );
  if (!data?.data) throw new Error('Cập nhật payout thất bại.');
  return data.data;
}

export interface PlatformRevenueSummaryResponse {
  totalGMV: number;
  totalCommission: number;
  totalTaxWithheld: number;
  totalNetSellerAmount: number;
  totalPendingPayouts: number;
}

export interface PlatformLedgerItem {
  id: string;
  orderId: string;
  shopId: string;
  grossAmount: number;
  commissionRate: number;
  commissionFee: number;
  taxRate: number;
  taxWithheld: number;
  netSellerAmount: number;
  createdAt: string;
}

export interface GetPlatformLedgerListResponse {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  items: PlatformLedgerItem[];
}

export async function getPlatformRevenueSummary(query: {
  shopId?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<PlatformRevenueSummaryResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<PlatformRevenueSummaryResponse>>(
    '/admin/revenue/summary',
    {
      params: query,
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  return (
    res.data?.data ?? {
      totalGMV: 0,
      totalCommission: 0,
      totalTaxWithheld: 0,
      totalNetSellerAmount: 0,
      totalPendingPayouts: 0,
    }
  );
}

export async function getPlatformLedgerList(query: {
  page?: number;
  limit?: number;
  shopId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'grossAmount' | 'commissionFee';
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<GetPlatformLedgerListResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetPlatformLedgerListResponse>>(
    '/admin/revenue/ledger',
    {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        ...(query.shopId ? { shopId: query.shopId } : {}),
        ...(query.startDate ? { startDate: query.startDate } : {}),
        ...(query.endDate ? { endDate: query.endDate } : {}),
        ...(query.sortBy ? { sortBy: query.sortBy } : {}),
        ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
      },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );

  return (
    res.data?.data ?? {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalItems: 0,
      totalPages: 0,
      items: [],
    }
  );
}

