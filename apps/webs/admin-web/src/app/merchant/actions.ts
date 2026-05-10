'use server';

import { revalidatePath } from 'next/cache';
import { updateMerchant } from '../../lib/admin-shop-wallet';

function parseError(err: unknown) {
  const data = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join(', ');
  if (typeof data?.message === 'string') return data.message;
  return 'Cập nhật merchant thất bại.';
}

export async function updateMerchantApprovalAction(input: {
  id: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  canSell: boolean;
}) {
  try {
    await updateMerchant(input);
    revalidatePath('/merchant');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: parseError(error) };
  }
}
