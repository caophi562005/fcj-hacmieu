import {
  DiscountTypeEnums,
  PromotionScopeEnums,
  PromotionStatusEnums,
} from '@common/constants/promotion.constant';
import z from 'zod';
import { BaseSchema } from '../common/base.schema';

export const PromotionSchema = BaseSchema.extend({
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: PromotionStatusEnums,
  startsAt: z.any(),
  endsAt: z.any(),
  scope: PromotionScopeEnums,
  minOrderSubtotal: z.number().int(),
  discountType: DiscountTypeEnums,
  discountValue: z.number().int(),
  maxDiscount: z.number().int().optional(),
  totalLimit: z.number().int().optional(),
  usedCount: z.number().int(),
});

export const PromotionRedemptionSchema = z.object({
  id: z.uuid(),
  promotionId: z.uuid(),
  userId: z.uuid(),
  orderIds: z.array(z.uuid()),
  code: z.string(),
  discountType: DiscountTypeEnums,
  discountValue: z.number().int(),
  minOrderSubtotal: z.number().int(),
  maxDiscount: z.number().int().optional(),
  usedAt: z.any(),
  cancelledAt: z.any(),
  createdAt: z.any(),
});
