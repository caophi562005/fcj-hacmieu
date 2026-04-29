import { RedemptionStatusEnums } from '@common/constants/promotion.constant';
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

export const ClaimPromotionRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    promotionId: z.uuid(),
    userId: z.uuid(),
  })
  .strict();

export const GetMyVouchersRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    userId: z.uuid(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
    status: RedemptionStatusEnums.optional(),
  })
  .strict();

export type CreatePromotionRedemptionRequest = z.infer<
  typeof CreatePromotionRedemptionRequestSchema
>;
export type ClaimPromotionRequest = z.infer<typeof ClaimPromotionRequestSchema>;
export type GetMyVouchersRequest = z.infer<typeof GetMyVouchersRequestSchema>;
