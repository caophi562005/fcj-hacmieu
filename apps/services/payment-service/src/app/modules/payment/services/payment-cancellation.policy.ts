export type CancellationPaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export function classifyPaymentCancellation(
  status: CancellationPaymentStatus,
  method: 'COD' | 'ONLINE' | 'WALLET',
): 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED' {
  if (status === 'REFUNDED') return 'REFUNDED';
  if (status === 'REFUND_PENDING') return 'REFUND_PENDING';
  if (status === 'SUCCESS' && method === 'ONLINE') return 'REFUND_PENDING';
  return 'CANCELLED';
}
