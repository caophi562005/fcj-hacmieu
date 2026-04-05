import z from 'zod';

export const WebhookTransactionRequestSchema = z.object({
  id: z.number(),
  gateway: z.string(),
  transactionDate: z.string(),
  accountNumber: z.string().optional(),
  code: z.string().optional(),
  content: z.string().optional(),
  transferType: z.enum(['in', 'out']),
  transferAmount: z.number(),
  accumulated: z.number(),
  subAccount: z.string().nullish(),
  referenceCode: z.string().optional(),
  description: z.string(),
});

export type WebhookTransactionRequest = z.infer<
  typeof WebhookTransactionRequestSchema
>;
