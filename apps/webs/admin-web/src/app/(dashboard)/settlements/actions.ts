'use server';

import { revalidatePath } from 'next/cache';
import { updateAdminSettlement } from '../../../lib/admin-settlement';

function message(error: unknown) {
  const value = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value;
  return error instanceof Error
    ? error.message
    : 'Cập nhật trạng thái giải ngân thất bại.';
}

export async function updateSettlementAction(input: {
  settlementId: string;
  action: 'HOLD' | 'RELEASE' | 'CANCEL';
  reason?: string;
}) {
  try {
    await updateAdminSettlement(input);
    revalidatePath('/settlements');
    revalidatePath('/revenue');
    return { ok: true };
  } catch (error) {
    return { ok: false, message: message(error) };
  }
}
