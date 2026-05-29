'use server';

import type { MerchantResponse } from '@common/interfaces/models/shop';
import { revalidatePath } from 'next/cache';
import { createMerchant } from '../../../lib/shop';

export async function createMerchantAction(
  payload: Pick<MerchantResponse, 'type' | 'legalName' | 'taxCode'>,
) {
  try {
    await createMerchant(payload);
    revalidatePath('/profile/merchant');
    return { ok: true as const };
  } catch (error: any) {
    console.error('Lỗi khi tạo merchant:', error);
    return {
      ok: false as const,
      message: error?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
    };
  }
}
