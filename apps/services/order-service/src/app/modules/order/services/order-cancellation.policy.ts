import { OrderStatusValues, type OrderStatus } from '@common/constants/order.constant';

export type CancellationActor = {
  actorType: 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'SYSTEM';
  actorId: string;
  shopId?: string;
};

const cancellableStatuses = new Set<OrderStatus>([
  OrderStatusValues.PENDING,
  OrderStatusValues.CONFIRMED,
]);

const genericTransitions = new Map<OrderStatus, ReadonlySet<OrderStatus>>([
  [OrderStatusValues.PENDING, new Set([OrderStatusValues.CONFIRMED])],
  [OrderStatusValues.CONFIRMED, new Set([OrderStatusValues.SHIPPING])],
  [OrderStatusValues.SHIPPING, new Set([OrderStatusValues.COMPLETED])],
]);

export function canCancelOrder(status: string): boolean {
  return cancellableStatuses.has(status as OrderStatus);
}

export function isGenericTransitionAllowed(from: string, to: string): boolean {
  return genericTransitions.get(from as OrderStatus)?.has(to as OrderStatus) ?? false;
}

export function assertCancellationAuthorized(
  actor: CancellationActor,
  order: { userId: string; shopId: string },
): void {
  const authorized =
    actor.actorType === 'ADMIN' ||
    actor.actorType === 'SYSTEM' ||
    (actor.actorType === 'CUSTOMER' && actor.actorId === order.userId) ||
    (actor.actorType === 'SELLER' && actor.shopId === order.shopId);

  if (!authorized) throw new Error('Actor is not authorized to cancel this order');
}
