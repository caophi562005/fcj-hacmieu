import z from 'zod';

export const ReviewResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  sellerId: z.uuid(),
  productId: z.uuid(),
  orderId: z.uuid(),
  orderItemId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  content: z.string().optional(),
  mediaUrls: z.array(z.string().url()),
  deletedAt: z.any().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
  user: z
    .object({
      username: z.string(),
      avatar: z.string().optional(),
    })
    .optional(),
});

export const GetManyReviewsResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
  reviews: z.array(ReviewResponseSchema),
});

export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
export type GetManyReviewsResponse = z.infer<
  typeof GetManyReviewsResponseSchema
>;
