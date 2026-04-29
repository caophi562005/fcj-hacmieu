import { RedemptionStatusType } from '@common/constants/promotion.constant';
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetManyPromotionsResponse,
  GetMyVouchersResponse,
  PromotionRedemptionResponse,
} from '@common/interfaces/models/promotion';
import { cache } from 'react';
import { createServerApi } from './api';

export type VoucherStatus = RedemptionStatusType;

export type MyVouchersQuery = {
  page?: number;
  limit?: number;
  status?: VoucherStatus | null;
};

const EMPTY: GetMyVouchersResponse = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  redemptions: [],
};

// `React.cache` per-request scope: trong 1 request chỉ có 1 user → 1 access token,
// nên không cần đưa accessToken vào cache key. Cache theo (page, limit, status).
const _getMyVouchersCached = cache(
  async (
    page: number,
    limit: number,
    status: VoucherStatus | null,
  ): Promise<GetMyVouchersResponse> => {
    const api = await createServerApi();
    // BFF throw NotFoundException (404) khi totalItems === 0 — đó là trạng thái
    // bình thường, không phải lỗi. Cho axios chấp nhận 404 để interceptor không log,
    // rồi kiểm tra status thủ công.
    const res = await api.get<ApiResponse<GetMyVouchersResponse>>(
      '/promotion/voucher',
      {
        params: { page, limit, ...(status ? { status } : {}) },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
      },
    );
    if (res.status === 404) return EMPTY;
    return res.data?.data ?? EMPTY;
  },
);

export function getMyVouchers(
  query: MyVouchersQuery = {},
): Promise<GetMyVouchersResponse> {
  return _getMyVouchersCached(
    query.page ?? 1,
    query.limit ?? 20,
    query.status ?? null,
  );
}

/**
 * Lookup promotion theo code. Dùng khi user nhập mã ở form claim.
 * Trả về null nếu không tìm thấy.
 */
export async function findPromotionByCode(
  code: string,
): Promise<{ id: string; code: string; name: string } | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetManyPromotionsResponse>>(
    '/promotion/promotion',
    {
      params: { code, page: 1, limit: 1 },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return null;
  const list = res.data?.data?.promotions ?? [];
  const found = list.find((p) => p.code === code) ?? list[0];
  return found ? { id: found.id, code: found.code, name: found.name } : null;
}

export async function claimPromotion(
  promotionId: string,
): Promise<PromotionRedemptionResponse | null> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<PromotionRedemptionResponse>>(
    '/promotion/voucher/claim',
    { promotionId },
  );
  return data?.data ?? null;
}
