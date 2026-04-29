import { ImageTypeEnums } from '@common/constants/media.constant';
import z from 'zod';

export const CreatePresignedUrlRequestSchema = z
  .object({
    fileName: z.string(),
    type: ImageTypeEnums,
    userId: z.uuid(),
    processId: z.uuid().optional(),
  })
  .strict();

export type CreatePresignedUrlRequest = z.infer<
  typeof CreatePresignedUrlRequestSchema
>;
