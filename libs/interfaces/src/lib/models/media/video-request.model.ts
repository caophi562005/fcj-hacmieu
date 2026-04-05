import { VideoSchema } from '@common/schemas/media';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../common/pagination.model';

export const GetVideoRequestSchema = z.object({
  id: z.string(),
  processId: z.uuid().optional(),
});

export const CreateVideoRequestSchema = VideoSchema.pick({
  id: true,
  storageBucket: true,
  storageKey: true,
  size: true,
  userId: true,
  filetype: true,
  title: true,
  productId: true,
}).extend({
  processId: z.uuid().optional(),
});

export const UpdateVideoRequestSchema = VideoSchema.pick({
  status: true,
  updatedById: true,
  duration: true,
  width: true,
  height: true,
  title: true,
})
  .partial()
  .extend({
    id: z.uuid(),
    processId: z.uuid().optional(),
  });

export const DeleteVideoRequestSchema = VideoSchema.pick({
  id: true,
  deletedById: true,
}).extend({
  processId: z.uuid().optional(),
});

export const ProcessVideoRequestSchema = z.object({
  id: z.string(),
  storageKey: z.string(),
  processId: z.uuid().optional(),
  userId: z.uuid(),
  productId: z.string().optional(),
});

export const GetManyVideosRequestSchema = VideoSchema.pick({
  userId: true,
  status: true,
  title: true,
})
  .partial()
  .extend({
    processId: z.uuid().optional(),
    page: PaginationQueryRequestSchema.shape.page,
    limit: PaginationQueryRequestSchema.shape.limit,
  });

export const GetRandomVideosRequestSchema = z.object({
  limit: z.coerce.number(),
  processId: z.uuid().optional(),
});

export type GetVideoRequest = z.infer<typeof GetVideoRequestSchema>;
export type GetManyVideosRequest = z.infer<typeof GetManyVideosRequestSchema>;
export type CreateVideoRequest = z.infer<typeof CreateVideoRequestSchema>;
export type UpdateVideoRequest = z.infer<typeof UpdateVideoRequestSchema>;
export type DeleteVideoRequest = z.infer<typeof DeleteVideoRequestSchema>;
export type ProcessVideoRequest = z.infer<typeof ProcessVideoRequestSchema>;
export type GetRandomVideosRequest = z.infer<
  typeof GetRandomVideosRequestSchema
>;
