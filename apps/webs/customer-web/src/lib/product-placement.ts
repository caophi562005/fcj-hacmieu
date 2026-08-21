import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type { GetProductPlacementsResponse } from '@common/interfaces/proto-types/wallet';
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

export async function getHomeProductPlacements(): Promise<GetProductPlacementsResponse> {
  const api = await createServerApi();
  const response = await api.get<ApiResponse<GetProductPlacementsResponse>>(
    '/marketing/placements/home',
    {
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 404,
    },
  );
  return normalizePlacements(response.data?.data);
}
