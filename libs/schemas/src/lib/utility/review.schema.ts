import z from 'zod';
import { BaseSchema } from '../common/base.schema';

export const ReviewSchema = BaseSchema.extend({
  userId: z.uuid(),
  sellerId: z.uuid(),
  productId: z.uuid(),
  orderId: z.uuid(),
  orderItemId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  content: z.string().max(1000).optional(),
  mediaUrls: z.array(z.string().url()).default([]),
});

export type Review = z.infer<typeof ReviewSchema>;
