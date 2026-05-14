import z from 'zod';

export const GetReviewSummaryRequestSchema = z
  .object({
    productId: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export const GenerateReviewSummaryRequestSchema = z
  .object({
    productId: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export type GetReviewSummaryRequest = z.infer<
  typeof GetReviewSummaryRequestSchema
>;
export type GenerateReviewSummaryRequest = z.infer<
  typeof GenerateReviewSummaryRequestSchema
>;
