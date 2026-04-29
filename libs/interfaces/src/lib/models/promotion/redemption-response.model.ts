import { PromotionRedemptionSchema } from '@common/schemas/promotion';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const PromotionRedemptionResponseSchema = PromotionRedemptionSchema;

export const GetMyVouchersResponseSchema = PaginationQueryResponseSchema.extend(
  {
    redemptions: z.array(PromotionRedemptionResponseSchema),
  },
);

export type PromotionRedemptionResponse = z.infer<
  typeof PromotionRedemptionResponseSchema
>;
export type GetMyVouchersResponse = z.infer<typeof GetMyVouchersResponseSchema>;
