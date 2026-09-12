export type InventoryReservationStatus =
  | 'RESERVED'
  | 'RELEASED'
  | 'CANCELLED_BEFORE_RESERVE';
export type InventoryCommand = 'RESERVE' | 'RELEASE';

export function applyInventoryCommand(
  status: InventoryReservationStatus | undefined,
  command: InventoryCommand,
  _items: ReadonlyArray<{ skuId: string; quantity: number }>,
): {
  action: 'DECREMENT' | 'INCREMENT' | 'TOMBSTONE' | 'NONE';
  nextStatus: InventoryReservationStatus;
} {
  if (command === 'RESERVE') {
    if (!status) return { action: 'DECREMENT', nextStatus: 'RESERVED' };
    return { action: 'NONE', nextStatus: status };
  }
  if (!status) {
    return { action: 'TOMBSTONE', nextStatus: 'CANCELLED_BEFORE_RESERVE' };
  }
  if (status === 'RESERVED') {
    return { action: 'INCREMENT', nextStatus: 'RELEASED' };
  }
  return { action: 'NONE', nextStatus: status };
}
