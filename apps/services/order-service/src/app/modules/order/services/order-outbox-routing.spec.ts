import { getOutboxQueueKey } from './order-outbox-routing';

describe('order outbox routing', () => {
  it.each([
    ['INVENTORY_RESERVE', 'INVENTORY_COMMAND'],
    ['INVENTORY_RELEASE', 'INVENTORY_COMMAND'],
    ['PAYMENT_CANCEL', 'PAYMENT_COMMAND'],
    ['WALLET_REFUND', 'WALLET_COMMAND'],
    ['PROMOTION_RELEASE', 'PROMOTION_COMMAND'],
    ['ORDER_CANCELLED_NOTIFICATION', 'NOTIFICATION_COMMAND'],
    ['ORDER_COMPLETED', 'SETTLEMENT'],
  ])('routes %s to %s', (eventType, expected) => {
    expect(getOutboxQueueKey(eventType)).toBe(expected);
  });

  it('rejects unknown events instead of silently misrouting them', () => {
    expect(() => getOutboxQueueKey('UNKNOWN')).toThrow(/outbox/i);
  });
});
