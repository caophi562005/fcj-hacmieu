import { PayoutRequestSchema } from '@common/schemas/wallet';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const ShopPayoutResponseSchema = PayoutRequestSchema;

export const GetShopPayoutsResponseSchema =
  PaginationQueryResponseSchema.extend({
    payouts: z.array(ShopPayoutResponseSchema),
  });

export type ShopPayoutResponse = z.infer<typeof ShopPayoutResponseSchema>;
export type GetShopPayoutsResponse = z.infer<
  typeof GetShopPayoutsResponseSchema
>;
