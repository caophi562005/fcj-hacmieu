'use server';

import { revalidatePath } from 'next/cache';
import { createShopPayout, deleteShopPayout } from '../../../lib/credit';

export type PayoutMutationResult = {
  ok: boolean;
  message: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  'Error.CreditInsufficientBalance':
    'Số dư không đủ để thực hiện yêu cầu rút tiền.',
  'Error.PayoutAmountTooLow': 'Số tiền rút tối thiểu chưa đạt yêu cầu.',
  'Error.PayoutNotFound': 'Không tìm thấy yêu cầu rút tiền.',
  'Error.ShopNotFound': 'Không tìm thấy thông tin cửa hàng.',
};

function extractErrorMessage(err: unknown): string {
  const message = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.map((m) => ERROR_MESSAGES[m] ?? m).join(', ');
  }

  if (typeof message === 'string') {
    return ERROR_MESSAGES[message] ?? message;
  }

  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

export async function createPayoutAction(
  _prevState: PayoutMutationResult,
  formData: FormData,
): Promise<PayoutMutationResult> {
  try {
    const amount = Number(formData.get('amount'));
    const bankName = String(formData.get('bankName') ?? '').trim();
    const accountNumber = String(formData.get('accountNumber') ?? '').trim();
    const accountHolder = String(formData.get('accountHolder') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        ok: false,
        message: 'Số tiền rút phải lớn hơn 0.',
      };
    }

    if (!bankName || !accountNumber || !accountHolder) {
      return {
        ok: false,
        message: 'Vui lòng nhập đầy đủ thông tin ngân hàng.',
      };
    }

    await createShopPayout({
      amount: Math.floor(amount),
      bankName,
      accountNumber,
      accountHolder,
      note: note || undefined,
    });

    revalidatePath('/finance');
    revalidatePath('/finance/payouts');

    return {
      ok: true,
      message: 'Đã tạo yêu cầu rút tiền.',
    };
  } catch (error) {
    return {
      ok: false,
      message: extractErrorMessage(error),
    };
  }
}

export async function cancelPayoutAction(
  payoutId: string,
): Promise<PayoutMutationResult> {
  try {
    await deleteShopPayout(payoutId);

    revalidatePath('/finance');
    revalidatePath('/finance/payouts');

    return {
      ok: true,
      message: 'Đã huỷ yêu cầu rút tiền.',
    };
  } catch (error) {
    return {
      ok: false,
      message: extractErrorMessage(error),
    };
  }
}
