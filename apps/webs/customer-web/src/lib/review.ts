import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  CreateReviewRequest,
  GetManyReviewsResponse,
  ReviewResponse,
} from '@common/interfaces/models/utility';
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
  const limit = query.limit ?? 10;

  const api = await createServerApi();
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
}

export async function getMyReviewByOrderItemId(
  orderItemId: string,
): Promise<ReviewResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<ReviewResponse>>(
    `/utility/review/${orderItemId}`,
    {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );

  if (res.status === 404) return null;
  return res.data?.data ?? null;
}

export type CreateMyReviewPayload = Omit<CreateReviewRequest, 'processId'>;

export async function createMyReview(
  payload: CreateMyReviewPayload,
): Promise<ReviewResponse> {
  const api = await createServerApi();
  const { data } = await api.post<ApiResponse<ReviewResponse>>(
    '/utility/review',
    payload,
  );

  if (!data?.data) {
    throw new Error('Không thể tạo đánh giá');
  }

  return data.data;
}
