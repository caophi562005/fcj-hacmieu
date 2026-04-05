import { MessageSchema } from '@common/schemas/chat';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../../common/pagination.model';

export const GetManyMessagesRequestSchema = PaginationQueryRequestSchema.extend(
  {
    conversationId: z.uuid(),
    senderId: z.uuid(),
    processId: z.uuid().optional(),
  }
).strict();

export const CreateMessageRequestSchema = MessageSchema.pick({
  content: true,
  conversationId: true,
  metadata: true,
  type: true,
  senderId: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export type GetManyMessagesRequest = z.infer<
  typeof GetManyMessagesRequestSchema
>;
export type CreateMessageRequest = z.infer<typeof CreateMessageRequestSchema>;
