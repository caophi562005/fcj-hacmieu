import {
  createReviewSummaryClient,
  type ReviewSummaryResponse,
} from '@common/web-core/lib/server-review-summary';
import { createServerApi } from './api';

export type { ReviewSummaryResponse };

const adminReviewSummaryClient = createReviewSummaryClient(createServerApi);
export const { getReviewSummary } = adminReviewSummaryClient;
