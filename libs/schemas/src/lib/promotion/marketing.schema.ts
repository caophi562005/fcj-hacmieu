import {
  MarketingCampaignStatusEnums,
  MarketingDeliveryStatusEnums,
  MarketingDeliveryTypeEnums,
} from '@common/constants/promotion.constant';
import { z } from 'zod';

export const MarketingCampaignSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  type: z.literal('PROMOTION_ANNOUNCEMENT'),
  status: MarketingCampaignStatusEnums,
  promotionId: z.uuid(),
  promotionCode: z.string(),
  promotionName: z.string(),
  subject: z.string(),
  preheader: z.string().nullable().optional(),
  introContent: z.string(),
  scheduledAt: z.any().nullable().optional(),
  startedAt: z.any().nullable().optional(),
  completedAt: z.any().nullable().optional(),
  recipientCount: z.number().int(),
  sentCount: z.number().int(),
  deliveredCount: z.number().int(),
  openedCount: z.number().int(),
  clickedCount: z.number().int(),
  bouncedCount: z.number().int(),
  complainedCount: z.number().int(),
  createdById: z.uuid(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const MarketingDeliverySchema = z.object({
  id: z.uuid(),
  type: MarketingDeliveryTypeEnums,
  status: MarketingDeliveryStatusEnums,
  campaignId: z.uuid().nullable().optional(),
  promotionId: z.uuid(),
  redemptionId: z.uuid().nullable().optional(),
  userId: z.uuid(),
  recipientEmail: z.email(),
  providerMessageId: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  sentAt: z.any().nullable().optional(),
  createdAt: z.any(),
});
