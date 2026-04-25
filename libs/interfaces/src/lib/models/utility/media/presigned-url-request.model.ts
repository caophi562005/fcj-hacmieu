import z from 'zod';

export const CreatePresignedUrlRequestSchema = z
  .object({
    fileName: z.string(),
    fileType: z.string().optional(),
    fileSize: z.number().optional(),
  })
  .strict();

export type CreatePresignedUrlRequest = z.infer<
  typeof CreatePresignedUrlRequestSchema
>;
