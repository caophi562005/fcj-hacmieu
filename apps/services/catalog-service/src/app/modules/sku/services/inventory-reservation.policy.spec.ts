import { applyInventoryCommand } from './inventory-reservation.policy';

describe('inventory reservation command policy', () => {
  const items = [{ skuId: 'sku-1', quantity: 2 }];

  it('reserves once and makes duplicate reserve a no-op', () => {
    const reserved = applyInventoryCommand(undefined, 'RESERVE', items);
    expect(reserved).toEqual({ action: 'DECREMENT', nextStatus: 'RESERVED' });
    expect(applyInventoryCommand('RESERVED', 'RESERVE', items)).toEqual({
      action: 'NONE',
      nextStatus: 'RESERVED',
    });
  });

  it('releases exactly once', () => {
    expect(applyInventoryCommand('RESERVED', 'RELEASE', items)).toEqual({
      action: 'INCREMENT',
      nextStatus: 'RELEASED',
    });
    expect(applyInventoryCommand('RELEASED', 'RELEASE', items).action).toBe(
      'NONE',
    );
  });

  it('creates a durable tombstone for cancel-before-reserve', () => {
    expect(applyInventoryCommand(undefined, 'RELEASE', items)).toEqual({
      action: 'TOMBSTONE',
      nextStatus: 'CANCELLED_BEFORE_RESERVE',
    });
    expect(
      applyInventoryCommand('CANCELLED_BEFORE_RESERVE', 'RESERVE', items)
        .action,
    ).toBe('NONE');
  });
});
