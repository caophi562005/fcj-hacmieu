import z from 'zod';

export const CreateReplyResponseSchema = z.object({
  ReplyId: z.uuid(),
  ReviewId: z.uuid(),
  SellerId: z.uuid(),
  Content: z.string(),
  CreatedAt: z.any(),
});

export type CreateReplyResponse = z.infer<typeof CreateReplyResponseSchema>;
