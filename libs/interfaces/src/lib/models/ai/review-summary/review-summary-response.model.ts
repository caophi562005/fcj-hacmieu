import z from 'zod';

export const ReviewSummaryResponseSchema = z.object({
  id: z.string(),
  productId: z.uuid(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  summary: z.string(),
  reviewCount: z.number().int(),
  lastReviewAt: z.any(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export type ReviewSummaryResponse = z.infer<typeof ReviewSummaryResponseSchema>;
