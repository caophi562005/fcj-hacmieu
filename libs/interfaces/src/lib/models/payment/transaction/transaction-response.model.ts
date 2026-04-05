import z from 'zod';

export const WebhookTransactionResponseSchema = z.object({
  message: z.string(),
  paymentCode: z.string(),
  paymentId: z.uuid(),
  userId: z.string(),
});

export type WebhookTransactionResponse = z.infer<
  typeof WebhookTransactionResponseSchema
>;
