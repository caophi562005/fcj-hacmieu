import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetProductPlacementsResponse,
  ProductPlacementConfigResponse,
  ProductPlacementResponse,
} from '@common/interfaces/proto-types/wallet';
import { createServerApi } from './api';

function normalizePlacements(
  payload: Partial<GetProductPlacementsResponse> | undefined,
  page: number,
  limit: number,
): GetProductPlacementsResponse {
  return {
    page: payload?.page ?? page,
    limit: payload?.limit ?? limit,
    totalItems: payload?.totalItems ?? 0,
    totalPages: payload?.totalPages ?? 0,
    placements: Array.isArray(payload?.placements) ? payload.placements : [],
  };
}

export type AdminProductPlacementQuery = {
  page?: number;
  limit?: number;
  shopId?: string;
  status?: string;
};

export async function getAdminPlacementConfig() {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<ProductPlacementConfigResponse>>(
    '/admin/placements/config',
  );
  return res.data?.data;
}

export async function getAdminProductPlacements(
  query: AdminProductPlacementQuery = {},
): Promise<GetProductPlacementsResponse> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetProductPlacementsResponse>>(
    '/admin/placements',
    {
      params: {
        page,
        limit,
        ...(query.shopId ? { shopId: query.shopId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
    },
  );
  return normalizePlacements(res.data?.data, page, limit);
}

export async function cancelAdminProductPlacement(
  placementId: string,
  reason: string,
): Promise<ProductPlacementResponse> {
  const api = await createServerApi();
  const res = await api.patch<ApiResponse<ProductPlacementResponse>>(
    `/admin/placements/${placementId}/cancel`,
    { reason },
  );
  if (!res.data?.data) throw new Error('Không thể hủy vị trí quảng bá.');
  return res.data.data;
}
