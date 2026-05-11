import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type { GetManyReviewsResponse } from '@common/interfaces/models/utility';
import { createServerApi } from './api';

type GetManyReviewsQuery = {
  page?: number;
  limit?: number;
  productId?: string;
};

const EMPTY_MANY: GetManyReviewsResponse = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 0,
  reviews: [],
};

export async function getManyReviews(
  query: GetManyReviewsQuery,
): Promise<GetManyReviewsResponse> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 5;
  const api = await createServerApi();
  try {
    const res = await api.get<ApiResponse<GetManyReviewsResponse>>(
      '/utility/review',
      {
        params: {
          page,
          limit,
          ...(query.productId ? { productId: query.productId } : {}),
        },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
      },
    );
    if (res.status === 404) return { ...EMPTY_MANY, page, limit };
    return res.data?.data ?? { ...EMPTY_MANY, page, limit };
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    const message = (err as { response?: { data?: { message?: unknown } } })
      ?.response?.data?.message;
    const normalizedMessage = Array.isArray(message)
      ? message.join(', ')
      : typeof message === 'string'
        ? message
        : '';

    if (
      status === 500 &&
      normalizedMessage.includes(
        "Cannot read properties of undefined (reading 'map')",
      )
    ) {
      return { ...EMPTY_MANY, page, limit };
    }

    throw err;
  }
}
