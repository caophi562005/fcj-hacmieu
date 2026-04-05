import { PromotionRedemptionSchema } from '@common/schemas/promotion';
import z from 'zod';

export const CreatePromotionRedemptionRequestSchema =
  PromotionRedemptionSchema.pick({
    promotionId: true,
    userId: true,
    orderIds: true,
    code: true,
    discountType: true,
    discountValue: true,
    minOrderSubtotal: true,
    maxDiscount: true,
  })
    .extend({
      processId: z.uuid().optional(),
    })
    .strict();

export type CreatePromotionRedemptionRequest = z.infer<
  typeof CreatePromotionRedemptionRequestSchema
>;
