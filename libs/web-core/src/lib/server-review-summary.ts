import type { ReviewSummaryResponse } from '@common/interfaces/models/ai';
import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type { AxiosInstance } from 'axios';

export type { ReviewSummaryResponse };

export function createReviewSummaryClient(
  createServerApi: () => Promise<AxiosInstance>,
) {
  async function getReviewSummary(
    productId: string,
  ): Promise<ReviewSummaryResponse | null> {
    const api = await createServerApi();
    const res = await api.get<ApiResponse<ReviewSummaryResponse>>(
      `/ai/review-summary/${productId}`,
      { validateStatus: (s) => (s >= 200 && s < 300) || s === 404 },
    );
    if (res.status === 404) return null;
    const data = res.data?.data;
    if (!data || !data.id || !data.summary) return null;
    return data;
  }

  return { getReviewSummary };
}
