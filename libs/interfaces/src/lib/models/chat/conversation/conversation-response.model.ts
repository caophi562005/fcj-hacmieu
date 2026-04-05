import { ConversationSchema } from '@common/schemas/chat';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const ConversationResponseSchema = ConversationSchema;

export const GetManyConversationsResponseSchema =
  PaginationQueryResponseSchema.extend({
    conversations: z.array(
      ConversationSchema.pick({
        id: true,
        participantIds: true,
        lastMessageId: true,
        lastMessageContent: true,
        lastMessageAt: true,
        lastSenderId: true,
        readStatus: true,
      }).extend({
        participants: z.array(
          z.object({
            id: z.string(),
            username: z.string(),
            avatar: z.string(),
          })
        ),
      })
    ),
  });

export type GetManyConversationsResponse = z.infer<
  typeof GetManyConversationsResponseSchema
>;
export type ConversationResponse = z.infer<typeof ConversationResponseSchema>;
