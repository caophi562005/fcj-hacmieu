import { describe, expect, it } from 'vitest';
import { SKURepository } from './sku.repository';

type ReservationStatus =
  | 'RESERVED'
  | 'RELEASED'
  | 'CANCELLED_BEFORE_RESERVE';

type Reservation = {
  id: string;
  orderId: string;
  userId: string;
  status: ReservationStatus;
  items: Array<{ skuId: string; quantity: number }>;
};

function createInventoryHarness(initialStock: Record<string, number>) {
  const stocks = new Map(Object.entries(initialStock));
  const reservations = new Map<string, Reservation>();
  let sequence = 0;
  let tail = Promise.resolve();

  const transactionClient = {
    inventoryReservation: {
      findUnique: async ({ where }: { where: { orderId: string } }) => {
        const reservation = reservations.get(where.orderId);
        return reservation ? structuredClone(reservation) : null;
      },
      create: async ({ data }: { data: any }) => {
        if (reservations.has(data.orderId)) {
          const error = new Error('unique orderId') as Error & { code: string };
          error.code = 'P2002';
          throw error;
        }
        const reservation: Reservation = {
          id: `reservation-${++sequence}`,
          orderId: data.orderId,
          userId: data.userId,
          status: data.status,
          items: structuredClone(data.items?.create ?? []),
        };
        reservations.set(data.orderId, reservation);
        return structuredClone(reservation);
      },
      updateMany: async ({ where, data }: { where: any; data: any }) => {
        const reservation = Array.from(reservations.values()).find(
          (item) => item.id === where.id && item.status === where.status,
        );
        if (!reservation) return { count: 0 };
        reservation.status = data.status;
        return { count: 1 };
      },
      findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
        const reservation = Array.from(reservations.values()).find(
          (item) => item.id === where.id,
        );
        if (!reservation) throw new Error('reservation not found');
        return structuredClone(reservation);
      },
    },
    sKU: {
      updateMany: async ({ where, data }: { where: any; data: any }) => {
        const stock = stocks.get(where.id);
        const decrement = data.stock?.decrement ?? 0;
        if (stock == null || stock < where.stock.gte) return { count: 0 };
        stocks.set(where.id, stock - decrement);
        return { count: 1 };
      },
      update: async ({ where, data }: { where: any; data: any }) => {
        const stock = stocks.get(where.id);
        if (stock == null) throw new Error('sku not found');
        stocks.set(where.id, stock + (data.stock?.increment ?? 0));
        return { id: where.id, stock: stocks.get(where.id) };
      },
    },
  };

  const prisma = {
    $transaction: <T>(operation: (tx: typeof transactionClient) => Promise<T>) => {
      const run = tail.then(() => operation(transactionClient));
      tail = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
  };

  return {
    repository: new SKURepository(prisma as never),
    stock: (skuId: string) => stocks.get(skuId),
    reservation: (orderId: string) => reservations.get(orderId),
  };
}

const item = { skuId: 'sku-1', quantity: 1 };

describe('SKURepository inventory reservation', () => {
  it('allows exactly one of two concurrent checkouts when stock is 1', async () => {
    const harness = createInventoryHarness({ 'sku-1': 1 });

    const results = await Promise.allSettled([
      harness.repository.reserve({
        orderId: 'order-a',
        userId: 'user-a',
        items: [item],
      }),
      harness.repository.reserve({
        orderId: 'order-b',
        userId: 'user-b',
        items: [item],
      }),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(harness.stock('sku-1')).toBe(0);
  });

  it('does not decrement twice for duplicate reserve messages', async () => {
    const harness = createInventoryHarness({ 'sku-1': 2 });
    const command = { orderId: 'order-1', userId: 'user-1', items: [item] };

    await harness.repository.reserve(command);
    await harness.repository.reserve(command);

    expect(harness.stock('sku-1')).toBe(1);
    expect(harness.reservation('order-1')?.status).toBe('RESERVED');
  });

  it('creates a tombstone when release arrives before reserve', async () => {
    const harness = createInventoryHarness({ 'sku-1': 1 });
    const command = { orderId: 'order-1', userId: 'user-1', items: [item] };

    await harness.repository.release(command);
    await harness.repository.reserve(command);

    expect(harness.stock('sku-1')).toBe(1);
    expect(harness.reservation('order-1')?.status).toBe(
      'CANCELLED_BEFORE_RESERVE',
    );
  });

  it('increments stock exactly once for duplicate release messages', async () => {
    const harness = createInventoryHarness({ 'sku-1': 1 });
    const command = { orderId: 'order-1', userId: 'user-1', items: [item] };

    await harness.repository.reserve(command);
    await harness.repository.release(command);
    await harness.repository.release(command);

    expect(harness.stock('sku-1')).toBe(1);
    expect(harness.reservation('order-1')?.status).toBe('RELEASED');
  });
});
