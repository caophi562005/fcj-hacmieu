export enum RedisChannel {
  NOTIFICATION_CHANNEL = 'NOTIFICATION_CHANNEL',
  MESSAGE_CHANNEL = 'MESSAGE_CHANNEL',
  UPDATE_CONVERSATION_CHANNEL = 'UPDATE_CONVERSATION_CHANNEL',
  PAYMENT_CHANNEL = 'PAYMENT_CHANNEL',
}

export enum RedisNamespace {
  NOTIFICATION = 'notification',
  MESSAGE = 'message',
  CONVERSATION = 'conversation',
}

export const RedisEvent = {
  NEW_NOTIFICATION: 'newNotification',
  REFRESH_CONVERSATIONS: 'refreshConversations',
};
