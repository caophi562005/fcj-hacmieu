import z from 'zod';

export const ReadStatusSchema = z.record(
  z.string(),
  z.object({
    isRead: z.boolean(),
    lastSeenMessageId: z.uuid().nullable(),
    deletedAt: z.any().nullable(),
  })
);

export const ConversationSchema = z.object({
  id: z.uuid(),
  participantIds: z.array(z.uuid()).length(2),

  lastMessageId: z.uuid().nullable(),
  lastMessageContent: z.string().nullable(),
  lastMessageAt: z.any().nullable(),
  lastSenderId: z.uuid().nullable(),

  readStatus: ReadStatusSchema,
  createdAt: z.any(),
  updatedAt: z.any(),
});

export type ReadStatus = z.infer<typeof ReadStatusSchema>;
