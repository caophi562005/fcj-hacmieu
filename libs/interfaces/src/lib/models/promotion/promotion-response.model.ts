import { PromotionSchema } from '@common/schemas/promotion';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const PromotionResponseSchema = PromotionSchema;

export const GetPromotionResponseSchema = PromotionResponseSchema;

export const GetManyPromotionsResponseSchema =
  PaginationQueryResponseSchema.extend({
    promotions: z.array(
      PromotionSchema.pick({
        id: true,
        code: true,
        name: true,
        startsAt: true,
        endsAt: true,
        status: true,
        scope: true,
        discountType: true,
        totalLimit: true,
      })
    ),
  });

export type GetManyPromotionsResponse = z.infer<
  typeof GetManyPromotionsResponseSchema
>;
export type GetPromotionResponse = z.infer<typeof GetPromotionResponseSchema>;
export type PromotionResponse = z.infer<typeof PromotionResponseSchema>;
