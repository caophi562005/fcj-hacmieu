import { VideoSchema } from '@common/schemas/media';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const VideoResponseSchema = VideoSchema;

export const GetVideoResponseSchema = z.object({
  id: z.uuid(),
  storageBucket: z.string(),
  storageKey: z.string(),
  filetype: z.string(),
  size: z.number(),
  status: z.string(),
  duration: z.number(),
  width: z.number(),
  height: z.number(),
  createdAt: z.any(),
  updatedAt: z.any(),
  title: z.string(),
  likeCount: z.number(),
  commentCount: z.number(),
  authorId: z.uuid(),
  productId: z.uuid().optional(),
  authorUsername: z.string().nullable(),
  authorAvatar: z.string().nullable(),
});

export const GetManyVideosResponseSchema = PaginationQueryResponseSchema.extend(
  {
    videos: z.array(
      GetVideoResponseSchema.pick({
        id: true,
        size: true,
        duration: true,
        width: true,
        height: true,
        status: true,
        title: true,
        likeCount: true,
        commentCount: true,
        authorId: true,
        productId: true,
      })
    ),
  }
);

export type VideoResponse = z.infer<typeof VideoResponseSchema>;
export type GetManyVideosResponse = z.infer<typeof GetManyVideosResponseSchema>;
export type GetVideoResponse = z.infer<typeof GetVideoResponseSchema>;
