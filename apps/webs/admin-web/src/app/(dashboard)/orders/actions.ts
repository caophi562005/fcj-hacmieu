'use server';

import type { OrderStatus } from '@common/constants/order.constant';
import { revalidatePath } from 'next/cache';
import { updateSellerOrderStatus } from '../../../lib/order';

export type OrderMutationResult = {
  ok: boolean;
  message?: string;
};

function extractErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  const m = data?.message;
  if (Array.isArray(m)) return m.join(', ');
  if (typeof m === 'string') return m;
  return 'Đã xảy ra lỗi, vui lòng thử lại.';
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
): Promise<OrderMutationResult> {
  try {
    await updateSellerOrderStatus(orderId, status);
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    return { ok: true };
  } catch (err) {
    console.error('[updateOrderStatusAction]', err);
    return { ok: false, message: extractErrorMessage(err) };
  }
}
