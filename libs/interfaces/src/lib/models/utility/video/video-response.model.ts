import z from 'zod';
import { VideoStatusEnums } from './video-request.model';

export const VideoResponseSchema = z.object({
  id: z.string(),
  shopId: z.string(),
  productId: z.string().nullable().optional(),
  status: VideoStatusEnums,
  isHidden: z.boolean(),
  duration: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  likeCount: z.number(),
  uploadedById: z.string(),
  deletedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  presignedUrl: z.string().optional(),
  hlsUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export type VideoResponse = z.infer<typeof VideoResponseSchema>;

export const GetManyVideosResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
  videos: z.array(VideoResponseSchema),
});

export type GetManyVideosResponse = z.infer<typeof GetManyVideosResponseSchema>;
