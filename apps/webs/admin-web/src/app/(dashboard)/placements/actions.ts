'use server';

import { revalidatePath } from 'next/cache';
import { cancelAdminProductPlacement } from '../../../lib/admin-product-placement';

function getMessage(error: unknown) {
  const value = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value;
  return error instanceof Error
    ? error.message
    : 'Không thể hủy vị trí quảng bá.';
}

export async function cancelProductPlacementAction(
  placementId: string,
  reason: string,
) {
  try {
    await cancelAdminProductPlacement(placementId, reason);
    revalidatePath('/placements');
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, message: getMessage(error) };
  }
}
