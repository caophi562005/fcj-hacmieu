import { NotificationSchema } from '@common/schemas/notification';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../common/pagination.model';

export const GetManyNotificationsRequestSchema =
  PaginationQueryRequestSchema.extend({
    type: NotificationSchema.shape.type.optional(),
    userId: NotificationSchema.shape.userId,
  })
    .extend({
      processId: z.uuid().optional(),
    })
    .strict();

export const GetNotificationRequestSchema = NotificationSchema.pick({
  id: true,
  userId: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const CreateNotificationRequestSchema = NotificationSchema.pick({
  title: true,
  description: true,
  userId: true,
  link: true,
  image: true,
  type: true,
  metadata: true,
  createdById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const ReadNotificationRequestSchema = NotificationSchema.pick({
  id: true,
  updatedById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const DeleteNotificationRequestSchema = NotificationSchema.pick({
  id: true,
  deletedById: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export type GetManyNotificationsRequest = z.infer<
  typeof GetManyNotificationsRequestSchema
>;
export type GetNotificationRequest = z.infer<
  typeof GetNotificationRequestSchema
>;
export type CreateNotificationRequest = z.infer<
  typeof CreateNotificationRequestSchema
>;
export type ReadNotificationRequest = z.infer<
  typeof ReadNotificationRequestSchema
>;
export type DeleteNotificationRequest = z.infer<
  typeof DeleteNotificationRequestSchema
>;
