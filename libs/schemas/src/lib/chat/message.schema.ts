import { MessageTypeEnums } from '@common/constants/chat.constant';
import z from 'zod';

export const MessageSchema = z.object({
  id: z.uuid(),
  conversationId: z.uuid(),
  senderId: z.uuid(),
  content: z.string(),
  type: MessageTypeEnums,
  metadata: z.any(),
  createdAt: z.any(),
});
