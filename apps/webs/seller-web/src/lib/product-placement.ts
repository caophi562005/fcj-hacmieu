import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  GetProductPlacementsResponse,
  ProductPlacementConfigResponse,
  ProductPlacementResponse,
} from '@common/interfaces/proto-types/wallet';
import { createServerApi } from './api';

function normalizePlacements(
  payload: Partial<GetProductPlacementsResponse> | undefined,
): GetProductPlacementsResponse {
  return {
    page: payload?.page ?? 1,
    limit: payload?.limit ?? 20,
    totalItems: payload?.totalItems ?? 0,
    totalPages: payload?.totalPages ?? 0,
    placements: Array.isArray(payload?.placements) ? payload.placements : [],
  };
}

export async function getPlacementConfig() {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<ProductPlacementConfigResponse>>(
    '/marketing/placements/config',
  );
  return res.data?.data;
}

export async function getMyPlacements(): Promise<GetProductPlacementsResponse> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetProductPlacementsResponse>>(
    '/marketing/placements',
    { params: { page: 1, limit: 20 } },
  );
  return normalizePlacements(res.data?.data);
}

export async function createPlacement(input: {
  productId: string;
  durationDays: number;
}) {
  const api = await createServerApi();
  const res = await api.post<ApiResponse<ProductPlacementResponse>>(
    '/marketing/placements',
    { ...input, idempotencyKey: crypto.randomUUID() },
  );
  if (!res.data?.data) throw new Error('Không thể mua vị trí quảng bá.');
  return res.data.data;
}
