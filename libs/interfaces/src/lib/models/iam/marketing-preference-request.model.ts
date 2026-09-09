import { MarketingTopicEnums } from '@common/constants/user.constant';
import { z } from 'zod';

export const GetMarketingPreferencesRequestSchema = z.object({
  processId: z.string().optional(),
  userId: z.uuid(),
});

export const UpdateMarketingPreferencesRequestSchema = z.object({
  processId: z.string().optional(),
  userId: z.uuid(),
  promotionOffers: z.boolean(),
  voucherReminders: z.boolean(),
  consentSource: z.string().min(1).max(100).default('PROFILE'),
  consentVersion: z.string().min(1).max(100).default('2026-09-07'),
});

export const GetMarketingRecipientsRequestSchema = z.object({
  processId: z.string().optional(),
  topic: MarketingTopicEnums,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(100),
  userIds: z.array(z.uuid()).max(500).default([]),
});

export const UnsubscribeMarketingRequestSchema = z.object({
  processId: z.string().optional(),
  email: z.email(),
  topic: MarketingTopicEnums,
});

export type GetMarketingPreferencesRequest = z.infer<
  typeof GetMarketingPreferencesRequestSchema
>;
export type UpdateMarketingPreferencesRequest = z.infer<
  typeof UpdateMarketingPreferencesRequestSchema
>;
export type GetMarketingRecipientsRequest = z.infer<
  typeof GetMarketingRecipientsRequestSchema
>;
export type UnsubscribeMarketingRequest = z.infer<
  typeof UnsubscribeMarketingRequestSchema
>;
