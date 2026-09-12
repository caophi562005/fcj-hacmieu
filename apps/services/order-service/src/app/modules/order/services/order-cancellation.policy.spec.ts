import { OrderStatusValues } from '@common/constants/order.constant';
import {
  assertCancellationAuthorized,
  canCancelOrder,
  isGenericTransitionAllowed,
} from './order-cancellation.policy';

describe('order cancellation state machine', () => {
  it.each([
    [OrderStatusValues.PENDING, true],
    [OrderStatusValues.CONFIRMED, true],
    [OrderStatusValues.SHIPPING, false],
    [OrderStatusValues.COMPLETED, false],
    [OrderStatusValues.CANCELLED, false],
    [OrderStatusValues.REFUNDED, false],
  ])('allows cancellation from %s = %s', (status, expected) => {
    expect(canCancelOrder(status)).toBe(expected);
  });

  it.each([
    [OrderStatusValues.PENDING, OrderStatusValues.CONFIRMED, true],
    [OrderStatusValues.CONFIRMED, OrderStatusValues.SHIPPING, true],
    [OrderStatusValues.SHIPPING, OrderStatusValues.COMPLETED, true],
    [OrderStatusValues.PENDING, OrderStatusValues.CANCELLED, false],
    [OrderStatusValues.CONFIRMED, OrderStatusValues.REFUNDED, false],
    [OrderStatusValues.SHIPPING, OrderStatusValues.CONFIRMED, false],
  ])('generic transition %s -> %s = %s', (from, to, expected) => {
    expect(isGenericTransitionAllowed(from, to)).toBe(expected);
  });

  it('authorizes a customer only for their order', () => {
    expect(() =>
      assertCancellationAuthorized(
        { actorType: 'CUSTOMER', actorId: 'u1' },
        { userId: 'u1', shopId: 's1' },
      ),
    ).not.toThrow();
    expect(() =>
      assertCancellationAuthorized(
        { actorType: 'CUSTOMER', actorId: 'u2' },
        { userId: 'u1', shopId: 's1' },
      ),
    ).toThrow(/authorized/i);
  });

  it('authorizes a seller by authoritative shop and always permits admin', () => {
    expect(() =>
      assertCancellationAuthorized(
        { actorType: 'SELLER', actorId: 'seller', shopId: 's1' },
        { userId: 'u1', shopId: 's1' },
      ),
    ).not.toThrow();
    expect(() =>
      assertCancellationAuthorized(
        { actorType: 'SELLER', actorId: 'seller', shopId: 's2' },
        { userId: 'u1', shopId: 's1' },
      ),
    ).toThrow(/authorized/i);
    expect(() =>
      assertCancellationAuthorized(
        { actorType: 'ADMIN', actorId: 'admin' },
        { userId: 'u1', shopId: 's1' },
      ),
    ).not.toThrow();
  });
});
