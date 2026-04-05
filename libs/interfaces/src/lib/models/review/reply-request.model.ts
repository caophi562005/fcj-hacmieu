import z from 'zod';

export const CreateReplyRequestSchema = z
  .object({
    reviewId: z.uuid(),
    shopId: z.uuid(),
    content: z.string().max(500),
    processId: z.uuid().optional(),
  })
  .strict();

export const UpdateReplyRequestSchema = z
  .object({
    id: z.uuid(),
    shopId: z.uuid(),
    content: z.string().max(500),
    processId: z.uuid().optional(),
  })
  .strict();

export const DeleteReplyRequestSchema = z.object({
  id: z.uuid(),
  shopId: z.uuid(),
  processId: z.uuid().optional(),
});

export type CreateReplyRequest = z.infer<typeof CreateReplyRequestSchema>;
export type UpdateReplyRequest = z.infer<typeof UpdateReplyRequestSchema>;
export type DeleteReplyRequest = z.infer<typeof DeleteReplyRequestSchema>;
