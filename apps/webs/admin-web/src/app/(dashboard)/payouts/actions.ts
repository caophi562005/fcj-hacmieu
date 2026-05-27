'use server';

import { revalidatePath } from 'next/cache';
import { updatePayoutStatus } from '../../../lib/admin-shop-wallet';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Cập nhật payout thất bại.';
}

export async function updatePayoutStatusAction(input: {
  shopId: string;
  payoutId: string;
  status: 'PENDING' | 'TRANSFERRED' | 'REJECTED';
}) {
  try {
    await updatePayoutStatus(input);
    revalidatePath('/payouts');
    revalidatePath(`/payouts/${input.payoutId}?shopId=${input.shopId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}
