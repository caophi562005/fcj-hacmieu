import { classifyPaymentCancellation } from './payment-cancellation.policy';

describe('payment cancellation compensation', () => {
  it.each([
    ['PENDING', 'ONLINE', 'CANCELLED'],
    ['PENDING', 'COD', 'CANCELLED'],
    ['FAILED', 'ONLINE', 'CANCELLED'],
    ['SUCCESS', 'COD', 'CANCELLED'],
    ['SUCCESS', 'ONLINE', 'REFUND_PENDING'],
  ] as const)(
    'maps %s %s to %s',
    (paymentStatus, method, expected) => {
      expect(classifyPaymentCancellation(paymentStatus, method)).toBe(expected);
    },
  );

  it('is stable for duplicate refund messages', () => {
    expect(classifyPaymentCancellation('REFUND_PENDING', 'ONLINE')).toBe(
      'REFUND_PENDING',
    );
  });
});
