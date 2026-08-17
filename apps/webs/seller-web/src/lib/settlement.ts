import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetSellerSettlementSummaryResponse,
  GetSellerSettlementsResponse,
  SellerSettlementDetailResponse,
} from '@common/interfaces/models/wallet';
import { createServerApi } from './api';

export type SettlementQuery = {
  page?: number;
  limit?: number;
  orderId?: string;
  status?: string;
  availableFrom?: string;
  availableTo?: string;
  sortBy?: string;
  sortOrder?: string;
};

const EMPTY_SUMMARY: GetSellerSettlementSummaryResponse = {
  pendingAmount: 0,
  pendingCount: 0,
  dueWithin24HoursAmount: 0,
  dueWithin24HoursCount: 0,
  heldAmount: 0,
  heldCount: 0,
  failedAmount: 0,
  failedCount: 0,
  settledAmount: 0,
  settledCount: 0,
  nextAvailableAt: null,
  nextAvailableAmount: 0,
};

function dateParam(value?: string, endOfDay = false) {
  if (!value) return undefined;
  return `${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`;
}

export async function getSettlementSummary() {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetSellerSettlementSummaryResponse>>(
    '/wallet/settlements/summary',
  );
  return res.data?.data ?? EMPTY_SUMMARY;
}

export async function getSettlements(
  query: SettlementQuery = {},
): Promise<GetSellerSettlementsResponse> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetSellerSettlementsResponse>>(
    '/wallet/settlements',
    {
      params: {
        page,
        limit,
        ...(query.orderId ? { orderId: query.orderId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.availableFrom
          ? { availableFrom: dateParam(query.availableFrom) }
          : {}),
        ...(query.availableTo
          ? { availableTo: dateParam(query.availableTo, true) }
          : {}),
        sortBy: query.sortBy ?? 'availableAt',
        sortOrder: query.sortOrder ?? 'asc',
      },
    },
  );
  const data = res.data?.data as
    | Partial<GetSellerSettlementsResponse>
    | undefined;

  return {
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    totalItems: data?.totalItems ?? 0,
    totalPages: data?.totalPages ?? 0,
    settlements: Array.isArray(data?.settlements) ? data.settlements : [],
  };
}

export async function getSettlementById(
  settlementId: string,
): Promise<SellerSettlementDetailResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<SellerSettlementDetailResponse>>(
    `/wallet/settlements/${settlementId}`,
    { validateStatus: (status) => status === 404 || status < 400 },
  );
  return res.status === 404 ? null : (res.data?.data ?? null);
}
