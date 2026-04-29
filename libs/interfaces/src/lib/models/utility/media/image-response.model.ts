import z from 'zod';

export const CreatePresignedUrlResponseSchema = z.object({
  presignedUrl: z.string(),
  url: z.string(),
});

export type CreatePresignedUrlResponse = z.infer<
  typeof CreatePresignedUrlResponseSchema
>;
