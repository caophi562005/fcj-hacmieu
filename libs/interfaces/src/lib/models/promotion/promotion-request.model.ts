import { PromotionSchema } from '@common/schemas/promotion';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../common/pagination.model';

export const GetManyPromotionsRequestSchema = PromotionSchema.pick({
  code: true,
  name: true,
  status: true,
  startsAt: true,
  endsAt: true,
  scope: true,
  discountType: true,
})
  .partial()
  .extend({
    processId: z.uuid().optional(),
    includeUsed: z.boolean().default(false),
    userId: z.uuid().optional(),
    page: PaginationQueryRequestSchema.shape.page,
    limit: PaginationQueryRequestSchema.shape.limit,
  })
  .strict();

export const GetPromotionRequestSchema = PromotionSchema.pick({
  id: true,
  code: true,
})
  .partial()
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const CreatePromotionRequestSchema = PromotionSchema.pick({
  code: true,
  name: true,
  description: true,

  status: true,
  startsAt: true,
  endsAt: true,

  scope: true,
  minOrderSubtotal: true,

  discountType: true,
  discountValue: true,
  maxDiscount: true,

  totalLimit: true,
  createdById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdatePromotionRequestSchema =
  CreatePromotionRequestSchema.partial()
    .extend({
      id: z.uuid(),
      updatedById: z.uuid(),
      processId: z.uuid().optional(),
    })
    .strict();

export const DeletePromotionRequestSchema = PromotionSchema.pick({
  id: true,
  deletedById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const CheckPromotionRequestSchema = z
  .object({
    code: z.string(),
    userId: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export type GetManyPromotionsRequest = z.infer<
  typeof GetManyPromotionsRequestSchema
>;
export type GetPromotionRequest = z.infer<typeof GetPromotionRequestSchema>;
export type CreatePromotionRequest = z.infer<
  typeof CreatePromotionRequestSchema
>;
export type UpdatePromotionRequest = z.infer<
  typeof UpdatePromotionRequestSchema
>;
export type DeletePromotionRequest = z.infer<
  typeof DeletePromotionRequestSchema
>;
export type CheckPromotionRequest = z.infer<typeof CheckPromotionRequestSchema>;
