'use server';

import { revalidatePath } from 'next/cache';
import { createPlacement } from '../../../lib/product-placement';

export type PlacementActionState = { ok: boolean; message: string };

function getMessage(error: unknown) {
  const value = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  const key = Array.isArray(value) ? value[0] : value;
  const messages: Record<string, string> = {
    'Error.CreditInsufficientBalance': 'Số dư tài chính của shop không đủ.',
    'Error.ShopAlreadyHasActivePlacement':
      'Shop đã có một vị trí đang hoạt động.',
    'Error.ProductPlacementSlotsFull': 'Hiện tại đã hết vị trí quảng bá.',
    'Error.ProductNotEligibleForPlacement':
      'Sản phẩm không còn đủ điều kiện quảng bá.',
  };
  if (typeof key === 'string') return messages[key] ?? key;
  return error instanceof Error
    ? error.message
    : 'Không thể mua vị trí quảng bá.';
}

export async function createPlacementAction(
  _previous: PlacementActionState,
  formData: FormData,
): Promise<PlacementActionState> {
  try {
    const productId = String(formData.get('productId') ?? '');
    const durationDays = Number(formData.get('durationDays'));
    if (!productId || ![1, 3, 7].includes(durationDays)) {
      return { ok: false, message: 'Vui lòng chọn sản phẩm và thời hạn.' };
    }
    await createPlacement({ productId, durationDays });
    revalidatePath('/marketing/placements');
    return { ok: true, message: 'Đã mua vị trí quảng bá thành công.' };
  } catch (error) {
    return { ok: false, message: getMessage(error) };
  }
}
