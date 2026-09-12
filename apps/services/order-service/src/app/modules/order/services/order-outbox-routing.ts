export type OutboxQueueKey =
  | 'INVENTORY_COMMAND'
  | 'PAYMENT_COMMAND'
  | 'WALLET_COMMAND'
  | 'PROMOTION_COMMAND'
  | 'NOTIFICATION_COMMAND'
  | 'SETTLEMENT';

const routes: Record<string, OutboxQueueKey> = {
  INVENTORY_RESERVE: 'INVENTORY_COMMAND',
  INVENTORY_RELEASE: 'INVENTORY_COMMAND',
  PAYMENT_CANCEL: 'PAYMENT_COMMAND',
  WALLET_REFUND: 'WALLET_COMMAND',
  PROMOTION_RELEASE: 'PROMOTION_COMMAND',
  ORDER_CANCELLED_NOTIFICATION: 'NOTIFICATION_COMMAND',
  ORDER_COMPLETED: 'SETTLEMENT',
};

export function getOutboxQueueKey(eventType: string): OutboxQueueKey {
  const queue = routes[eventType];
  if (!queue) throw new Error(`Unknown order outbox event type: ${eventType}`);
  return queue;
}
