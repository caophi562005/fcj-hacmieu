import { NotificationSchema } from '@common/schemas/notification';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const NotificationResponseSchema = NotificationSchema;

export const GetNotificationResponseSchema = NotificationResponseSchema.pick({
  id: true,
  userId: true,
  type: true,
  title: true,
  description: true,
  link: true,
  image: true,
  metadata: true,
  isRead: true,
  createdAt: true,
  updatedAt: true,
});

export const GetManyNotificationsResponseSchema =
  PaginationQueryResponseSchema.extend({
    notifications: z.array(GetNotificationResponseSchema),
  });

export type GetManyNotificationsResponse = z.infer<
  typeof GetManyNotificationsResponseSchema
>;
export type GetNotificationResponse = z.infer<
  typeof GetNotificationResponseSchema
>;
export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;
