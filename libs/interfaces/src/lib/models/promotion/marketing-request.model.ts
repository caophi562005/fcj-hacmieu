import { MarketingCampaignStatusEnums } from '@common/constants/promotion.constant';
import { z } from 'zod';

export const CreateMarketingCampaignRequestSchema = z.object({
  processId: z.string().optional(),
  name: z.string().trim().min(3).max(255),
  promotionId: z.uuid(),
  subject: z.string().trim().min(3).max(250),
  preheader: z.string().trim().max(250).optional(),
  introContent: z.string().trim().min(3).max(2000),
  scheduledAt: z.string().datetime().optional(),
  createdById: z.uuid(),
});

export const GetManyMarketingCampaignsRequestSchema = z.object({
  processId: z.string().optional(),
  status: MarketingCampaignStatusEnums.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const GetMarketingCampaignRequestSchema = z.object({
  processId: z.string().optional(),
  id: z.uuid(),
});

export const DispatchMarketingCampaignRequestSchema =
  GetMarketingCampaignRequestSchema;

export const ScanMarketingRequestSchema = z.object({
  processId: z.string().optional(),
  now: z.string().datetime().optional(),
});

export const ProcessMarketingDeliveryRequestSchema = z.object({
  processId: z.string().optional(),
  deliveryId: z.uuid(),
});

export const RecordMarketingWebhookRequestSchema = z.object({
  processId: z.string().optional(),
  payload: z.string().min(2),
  svixId: z.string().min(1),
  svixTimestamp: z.string().min(1),
  svixSignature: z.string().min(1),
});

export type CreateMarketingCampaignRequest = z.infer<
  typeof CreateMarketingCampaignRequestSchema
>;
export type GetManyMarketingCampaignsRequest = z.infer<
  typeof GetManyMarketingCampaignsRequestSchema
>;
export type GetMarketingCampaignRequest = z.infer<
  typeof GetMarketingCampaignRequestSchema
>;
export type DispatchMarketingCampaignRequest = z.infer<
  typeof DispatchMarketingCampaignRequestSchema
>;
export type ScanMarketingRequest = z.infer<typeof ScanMarketingRequestSchema>;
export type ProcessMarketingDeliveryRequest = z.infer<
  typeof ProcessMarketingDeliveryRequestSchema
>;
export type RecordMarketingWebhookRequest = z.infer<
  typeof RecordMarketingWebhookRequestSchema
>;
