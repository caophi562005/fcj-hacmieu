import { NotificationTypeEnums } from '@common/constants/notification.constant';
import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const MetadataSchema = z.object({
  orderId: z.uuid().optional(),
  articleId: z.uuid().optional(),
});

export const NotificationSchema = BaseSchema.extend({
  userId: z.uuid(),
  type: NotificationTypeEnums,
  title: z.string(),
  description: z.string(),
  link: z.url().optional(),
  image: z.url().optional(),
  isRead: z.boolean().default(false),
  metadata: MetadataSchema.optional(),
});

export type Metadata = z.infer<typeof MetadataSchema>;
