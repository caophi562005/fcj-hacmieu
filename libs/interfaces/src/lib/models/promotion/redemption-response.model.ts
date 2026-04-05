import { PromotionRedemptionSchema } from '@common/schemas/promotion';
import z from 'zod';

export const PromotionRedemptionResponseSchema = PromotionRedemptionSchema;

export type PromotionRedemptionResponse = z.infer<
  typeof PromotionRedemptionResponseSchema
>;
