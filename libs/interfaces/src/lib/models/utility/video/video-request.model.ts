import z from 'zod';

export const VideoStatusValues = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;

export const VideoStatusEnums = z.enum([
  VideoStatusValues.PENDING,
  VideoStatusValues.PROCESSING,
  VideoStatusValues.READY,
  VideoStatusValues.FAILED,
]);

export type VideoStatus = z.infer<typeof VideoStatusEnums>;

//=================================================================================================

export const CreateVideoRequestSchema = z.object({
  processId: z.string().optional(),
  shopId: z.uuid(),
  uploadedById: z.uuid(),
  productId: z.uuid().optional(),
});

export const GetManyVideosRequestSchema = z.object({
  processId: z.string().optional(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  shopId: z.uuid().optional(),
  productId: z.uuid().optional(),
  status: VideoStatusEnums.optional(),
});

export const GetVideoRequestSchema = z.object({
  processId: z.string().optional(),
  id: z.uuid(),
});

export const UpdateVideoStatusRequestSchema = z.object({
  processId: z.string().optional(),
  id: z.uuid(),
  status: VideoStatusEnums,
  duration: z.number().int().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
});

export const DeleteVideoRequestSchema = z.object({
  processId: z.string().optional(),
  id: z.uuid(),
});

export const UpdateVideoRequestSchema = z.object({
  processId: z.string().optional(),
  id: z.uuid(),
  productId: z.uuid().nullable().optional(),
  isHidden: z.boolean().optional(),
});

export const GetVideoFeedRequestSchema = z.object({
  processId: z.string().optional(),
  limit: z.number().int().positive().default(10),
  excludeIds: z.array(z.string()).default([]),
});

export type CreateVideoRequest = z.infer<typeof CreateVideoRequestSchema>;
export type GetManyVideosRequest = z.infer<typeof GetManyVideosRequestSchema>;
export type GetVideoRequest = z.infer<typeof GetVideoRequestSchema>;
export type UpdateVideoStatusRequest = z.infer<
  typeof UpdateVideoStatusRequestSchema
>;
export type DeleteVideoRequest = z.infer<typeof DeleteVideoRequestSchema>;
export type UpdateVideoRequest = z.infer<typeof UpdateVideoRequestSchema>;
export type GetVideoFeedRequest = z.infer<typeof GetVideoFeedRequestSchema>;
