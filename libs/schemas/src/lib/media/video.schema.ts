import { VideoStatusEnums } from '@common/constants/media.constant';
import z from 'zod';
import { BaseSchema } from '../common/base.schema';

export const VideoSchema = BaseSchema.extend({
  storageBucket: z.string(),
  storageKey: z.string(),
  size: z.number().int().nonnegative(),
  userId: z.uuid(),
  productId: z.uuid().optional(),
  filetype: z.string(),
  status: VideoStatusEnums,
  duration: z.number().int().default(0),
  width: z.number().int().default(0),
  height: z.number().int().default(0),
  title: z.string().default(''),
  likeCount: z.number().int().default(0),
  commentCount: z.number().int().default(0),
});
