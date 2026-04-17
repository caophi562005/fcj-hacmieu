import z from 'zod';

export const CreatePresignedUrlRequestSchema = z
  .object({
    filename: z.string(),
  })
  .strict();

export type CreatePresignedUrlRequest = z.infer<
  typeof CreatePresignedUrlRequestSchema
>;
