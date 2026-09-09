import { z } from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const MarketingPreferencesResponseSchema = z.object({
  userId: z.uuid(),
  promotionOffers: z.boolean(),
  voucherReminders: z.boolean(),
});

export const MarketingRecipientSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
  username: z.string(),
});

export const GetMarketingRecipientsResponseSchema =
  PaginationQueryResponseSchema.extend({
    recipients: z.array(MarketingRecipientSchema),
  });

export type MarketingPreferencesResponse = z.infer<
  typeof MarketingPreferencesResponseSchema
>;
export type MarketingRecipient = z.infer<typeof MarketingRecipientSchema>;
export type GetMarketingRecipientsResponse = z.infer<
  typeof GetMarketingRecipientsResponseSchema
>;
