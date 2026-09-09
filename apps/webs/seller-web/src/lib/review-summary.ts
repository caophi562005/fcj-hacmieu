import {
  createReviewSummaryClient,
  type ReviewSummaryResponse,
} from '@common/web-core/lib/server-review-summary';
import { createServerApi } from './api';

export type { ReviewSummaryResponse };

const sellerReviewSummaryClient = createReviewSummaryClient(createServerApi);
export const { getReviewSummary } = sellerReviewSummaryClient;
