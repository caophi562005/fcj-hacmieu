import z from 'zod';
import { PaginationQueryRequestSchema } from '../../common/pagination.model';

export const GetManyReviewsRequestSchema = PaginationQueryRequestSchema.extend({
  productId: z.uuid().optional(),
  sellerId: z.uuid().optional(),
  userId: z.uuid().optional(),
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const GetReviewRequestSchema = z
  .object({
    id: z.uuid(),
  })
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateReviewRequestSchema = z
  .object({
    userId: z.uuid(),
    sellerId: z.uuid(),
    productId: z.uuid(),
    orderId: z.uuid(),
    orderItemId: z.uuid(),
    rating: z.number().int().min(1).max(5),
    content: z.string().max(1000).optional(),
    mediaUrls: z.array(z.string().url()).default([]),
  })
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateReviewRequestSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    content: z.string().max(1000).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    mediaUrls: z.array(z.string().url()).optional(),
  })
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const DeleteReviewRequestSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
  })
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export type GetManyReviewsRequest = z.infer<typeof GetManyReviewsRequestSchema>;
export type GetReviewRequest = z.infer<typeof GetReviewRequestSchema>;
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;
export type UpdateReviewRequest = z.infer<typeof UpdateReviewRequestSchema>;
export type DeleteReviewRequest = z.infer<typeof DeleteReviewRequestSchema>;
