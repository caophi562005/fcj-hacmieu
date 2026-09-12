import { describe, expect, it, vi } from 'vitest';
import { OrderRepository } from './order.repository';

function pendingOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    code: 'ORDER1',
    userId: 'user-1',
    shopId: 'shop-1',
    sellerId: 'seller-1',
    status: 'PENDING',
    paymentMethod: 'ONLINE',
    paymentStatus: 'PENDING',
    paymentId: 'payment-1',
    itemTotal: 100,
    shippingFee: 10,
    discount: -30,
    voucherDiscount: 20,
    coinApplied: 10,
    grandTotal: 80,
    timeline: [],
    deletedAt: null,
    cancellation: null,
    items: [{ skuId: 'sku-1', quantity: 2 }],
    ...overrides,
  };
}

const command = {
  orderId: 'order-1',
  processId: 'process-1',
  actorType: 'CUSTOMER' as const,
  actorId: 'user-1',
  reasonCode: 'CHANGED_MIND',
};

describe('OrderRepository.cancel', () => {
  it('commits compare-and-set, audit, steps and one outbox event per effect in one transaction', async () => {
    const order = pendingOrder();
    const tx = {
      order: {
        findFirst: vi.fn().mockResolvedValue(order),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          ...order,
          status: 'CANCELLED',
          cancellation: { id: 'cancel-1', steps: [] },
        }),
      },
      orderCancellation: {
        create: vi.fn().mockResolvedValue({ id: 'cancel-1' }),
      },
      outboxEvent: { createMany: vi.fn().mockResolvedValue({ count: 5 }) },
    };
    const prisma = {
      $transaction: vi.fn(async (fn: (client: typeof tx) => unknown) => fn(tx)),
    };

    const result = await new OrderRepository(prisma as never).cancel(command);

    expect(result.status).toBe('CANCELLED');
    expect(tx.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'order-1', status: 'PENDING' }),
      }),
    );
    expect(tx.orderCancellation.create).toHaveBeenCalledOnce();
    const outbox = tx.outboxEvent.createMany.mock.calls[0][0].data;
    expect(outbox.map((event: { eventType: string }) => event.eventType)).toEqual([
      'INVENTORY_RELEASE',
      'PAYMENT_CANCEL',
      'ORDER_CANCELLED_NOTIFICATION',
      'WALLET_REFUND',
      'PROMOTION_RELEASE',
    ]);
  });

  it('returns the existing result after a concurrent retry without duplicating effects', async () => {
    const first = pendingOrder();
    const existing = pendingOrder({
      status: 'CANCELLED',
      cancellation: { id: 'cancel-1', steps: [] },
    });
    const tx = {
      order: {
        findFirst: vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(existing),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      orderCancellation: { create: vi.fn() },
      outboxEvent: { createMany: vi.fn() },
    };
    const prisma = {
      $transaction: vi.fn(async (fn: (client: typeof tx) => unknown) => fn(tx)),
    };

    const result = await new OrderRepository(prisma as never).cancel(command);

    expect(result.cancellation?.id).toBe('cancel-1');
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(tx.orderCancellation.create).not.toHaveBeenCalled();
    expect(tx.outboxEvent.createMany).not.toHaveBeenCalled();
  });
});
