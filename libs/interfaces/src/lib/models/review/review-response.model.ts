import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const CreateReviewResponseSchema = z.object({
  ReviewId: z.uuid(),
  ProductId: z.uuid(),
  UserId: z.uuid(),
  SellerId: z.uuid(),
  OrderId: z.uuid(),
  OrderItemId: z.uuid(),
  Rating: z.number().min(1).max(5),
  Content: z.string(),
  Medias: z.array(z.string()),
  CreatedAt: z.any(),
  UpdatedAt: z.any().optional(),
});

export const UpdateReviewResponseSchema = z.object({
  ReviewId: z.uuid(),
  ProductId: z.uuid(),
  UserId: z.uuid(),
  Rating: z.number().min(1).max(5),
  Content: z.string(),
  Medias: z.array(z.string()),
  UpdatedAt: z.any().optional(),
});

export const ReviewResponseSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  userId: z.uuid(),
  shopId: z.uuid(),
  orderId: z.uuid(),
  orderItemId: z.uuid(),
  rating: z.number().min(1).max(5),
  content: z.string(),
  medias: z.array(z.string()),
  createdAt: z.any(),
  updatedAt: z.any().optional(),
  reply: z
    .object({
      reviewId: z.uuid(),
      shopId: z.uuid(),
      content: z.string(),
    })
    .optional(),
});

export const GetManyProductReviewsResponseSchema =
  PaginationQueryResponseSchema.extend({
    reviews: z
      .array(
        z.object({
          productId: z.uuid(),
          productName: z.string(),
          rating: z.number(),
          id: z.uuid(),
          userId: z.uuid(),
          username: z.string().optional(),
          avatar: z.string().optional(),
          content: z.string(),
          medias: z.array(z.string()),
          createdAt: z.any(),
          reply: z.object({
            id: z.uuid(),
            reviewId: z.uuid(),
            shopId: z.uuid(),
            content: z.string(),
            createdAt: z.any(),
          }),
        })
      )
      .optional(),
    rating: z
      .object({
        productId: z.uuid(),
        averageRating: z.number(),
        totalReviews: z.number(),
        oneStarCount: z.number(),
        twoStarCount: z.number(),
        threeStarCount: z.number(),
        fourStarCount: z.number(),
        fiveStarCount: z.number(),
      })
      .optional(),
  });

export type CreateReviewResponse = z.infer<typeof CreateReviewResponseSchema>;
export type UpdateReviewResponse = z.infer<typeof UpdateReviewResponseSchema>;
export type GetManyProductReviewsResponse = z.infer<
  typeof GetManyProductReviewsResponseSchema
>;
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;
