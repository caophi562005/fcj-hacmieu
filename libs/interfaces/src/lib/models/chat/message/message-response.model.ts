import { MessageSchema } from '@common/schemas/chat';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const MessageResponseSchema = MessageSchema;

export const GetManyMessagesResponseSchema =
  PaginationQueryResponseSchema.extend({
    messages: z.array(
      MessageSchema.pick({
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        type: true,
        metadata: true,
        createdAt: true,
      })
    ),
  });

export type GetManyMessagesResponse = z.infer<
  typeof GetManyMessagesResponseSchema
>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
