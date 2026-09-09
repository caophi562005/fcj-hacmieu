import {
  MarketingCampaignSchema,
  MarketingDeliverySchema,
} from '@common/schemas/promotion';
import { z } from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const MarketingCampaignResponseSchema = MarketingCampaignSchema;

export const GetManyMarketingCampaignsResponseSchema =
  PaginationQueryResponseSchema.extend({
    campaigns: z.array(MarketingCampaignSchema),
  });

export const MarketingOperationResponseSchema = z.object({
  accepted: z.boolean(),
  queuedCount: z.number().int().nonnegative(),
  message: z.string(),
});

export const MarketingDeliveryResponseSchema = MarketingDeliverySchema;

export type MarketingCampaignResponse = z.infer<
  typeof MarketingCampaignResponseSchema
>;
export type GetManyMarketingCampaignsResponse = z.infer<
  typeof GetManyMarketingCampaignsResponseSchema
>;
export type MarketingOperationResponse = z.infer<
  typeof MarketingOperationResponseSchema
>;
export type MarketingDeliveryResponse = z.infer<
  typeof MarketingDeliveryResponseSchema
>;
