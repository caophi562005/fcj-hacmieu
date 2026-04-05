import z from 'zod';
import { PaginationQueryRequestSchema } from '../common/pagination.model';

export const GetManyProductReviewsRequestSchema =
  PaginationQueryRequestSchema.extend({
    productId: z.uuid().optional(),
    rating: z.coerce.number().min(1).max(5).default(1),
    userId: z.uuid().optional(),
    shopId: z.uuid().optional(),
  })
    .extend({
      processId: z.uuid().optional(),
    })
    .strict();

export const GetReviewRequestSchema = z
  .object({
    id: z.uuid().optional(),
    orderId: z.uuid().optional(),
    orderItemId: z.uuid().optional(),
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateProductReviewRequestSchema = z
  .object({
    orderItemId: z.uuid(),
    orderId: z.uuid(),
    rating: z.number().min(1).max(5),
    content: z.string().max(500),
    medias: z.array(z.string()),
    userId: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateProductReviewsRequestSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  rating: z.number().min(1).max(5).optional(),
  content: z.string().max(500).optional(),
  medias: z.array(z.string()),
  processId: z.uuid().optional(),
});

export const DeleteProductReviewRequestSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  processId: z.uuid().optional(),
});

export type GetManyProductReviewsRequest = z.infer<
  typeof GetManyProductReviewsRequestSchema
>;
export type CreateProductReviewRequest = z.infer<
  typeof CreateProductReviewRequestSchema
>;
export type UpdateProductReviewsRequest = z.infer<
  typeof UpdateProductReviewsRequestSchema
>;
export type DeleteProductReviewRequest = z.infer<
  typeof DeleteProductReviewRequestSchema
>;
export type GetReviewRequest = z.infer<typeof GetReviewRequestSchema>;
