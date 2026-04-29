'use server';

import { revalidatePath } from 'next/cache';
import { claimPromotion, findPromotionByCode } from '../../../lib/promotions';

export type ClaimVoucherState = {
  ok: boolean;
  message: string;
};

export async function claimVoucherAction(
  _prev: ClaimVoucherState,
  formData: FormData,
): Promise<ClaimVoucherState> {
  const raw = formData.get('code');
  const code = typeof raw === 'string' ? raw.trim() : '';
  if (!code) return { ok: false, message: 'Vui lòng nhập mã voucher.' };

  try {
    // 1) Tìm promotion theo code (BFF claim chỉ nhận `promotionId`).
    const promo = await findPromotionByCode(code);
    if (!promo) return { ok: false, message: 'Mã voucher không tồn tại.' };

    // 2) Claim. Backend tự enforce 1-user-1-voucher qua unique constraint
    //    → trả 409 "Error.PromotionAlreadyClaimed" nếu đã thu thập.
    await claimPromotion(promo.id);

    // 3) Revalidate kho voucher để page render lại với redemption mới.
    revalidatePath('/profile/voucher');
    return { ok: true, message: `Đã thu thập voucher "${promo.name}".` };
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    const apiMsg = (error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message;

    if (status === 409 || apiMsg === 'Error.PromotionAlreadyClaimed') {
      return { ok: false, message: 'Bạn đã thu thập voucher này rồi.' };
    }
    if (apiMsg === 'Error.PromotionNotActive') {
      return { ok: false, message: 'Voucher chưa được kích hoạt.' };
    }
    if (apiMsg === 'Error.PromotionNotStarted') {
      return { ok: false, message: 'Voucher chưa đến thời gian áp dụng.' };
    }
    if (apiMsg === 'Error.PromotionExpired') {
      return { ok: false, message: 'Voucher đã hết hạn.' };
    }
    if (apiMsg === 'Error.PromotionOutOfStock') {
      return { ok: false, message: 'Voucher đã hết lượt.' };
    }
    return { ok: false, message: 'Không thể thu thập voucher. Thử lại sau.' };
  }
}
