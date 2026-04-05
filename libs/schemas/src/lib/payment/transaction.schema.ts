import z from 'zod';

export const TransactionSchema = z.object({
  id: z.number(),
  gateway: z.string(),
  transactionDate: z.string(),
  accountNumber: z.string().optional(),
  subAccount: z.string().optional(),
  amountIn: z.number(),
  amountOut: z.number(),
  accumulated: z.number(),
  code: z.string().optional(),
  transactionContent: z.string().optional(),
  referenceNumber: z.string().optional(),
  body: z.string().optional(),
  createdAt: z.any(),
});
