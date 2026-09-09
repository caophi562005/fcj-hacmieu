'use server';

import { revalidatePath } from 'next/cache';
import { updateMarketingPreferences } from '../../lib/iam';

export type MarketingPreferencesState = { ok: boolean; message: string };

export async function updateMarketingPreferencesAction(
  _previous: MarketingPreferencesState,
  formData: FormData,
): Promise<MarketingPreferencesState> {
  try {
    await updateMarketingPreferences({
      promotionOffers: formData.get('promotionOffers') === 'on',
      voucherReminders: formData.get('voucherReminders') === 'on',
    });
    revalidatePath('/profile');
    return { ok: true, message: 'Đã cập nhật lựa chọn email.' };
  } catch {
    return { ok: false, message: 'Không thể cập nhật lựa chọn email.' };
  }
}
