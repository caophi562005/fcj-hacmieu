import { describe, expect, it, vi } from 'vitest';
import { TransactionRepository } from './transaction.repository';

const inbound = {
  id: 10,
  gateway: 'SEPAY',
  transactionDate: '2026-09-12 10:00:00',
  transferType: 'in' as const,
  transferAmount: 100,
  accumulated: 100,
  description: 'late transfer',
  code: 'PAYCODE',
};

describe('payment webhook race handling', () => {
  it('records a late inbound transfer but does not resurrect a cancelled payment', async () => {
    const tx = {
      payment: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'payment-1',
          code: 'PAYCODE',
          userId: 'user-1',
          amount: 100,
          status: 'CANCELLED',
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      paymentAllocation: { updateMany: vi.fn() },
      transaction: { create: vi.fn().mockResolvedValue({}) },
    };
    const prisma = {
      transaction: { findUnique: vi.fn().mockResolvedValue(null) },
      $transaction: vi.fn(async (fn: (client: typeof tx) => unknown) => fn(tx)),
    };

    const result = await new TransactionRepository(prisma as never).receiver(inbound);

    expect(result.shouldConfirmOrder).toBe(false);
    expect(tx.transaction.create).toHaveBeenCalledOnce();
    expect(tx.paymentAllocation.updateMany).not.toHaveBeenCalled();
  });

  it('rejects outbound transfers before writing anything', async () => {
    const prisma = { transaction: { findUnique: vi.fn() } };
    await expect(
      new TransactionRepository(prisma as never).receiver({
        ...inbound,
        transferType: 'out',
      }),
    ).rejects.toThrow(/direction/i);
    expect(prisma.transaction.findUnique).not.toHaveBeenCalled();
  });
});
