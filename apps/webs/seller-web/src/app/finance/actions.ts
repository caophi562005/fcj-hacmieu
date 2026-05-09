'use server';

import { revalidatePath } from 'next/cache';
import { getMerchant, updateShop } from '../../lib/shop';

type InquiryApiResponse = {
  result?: {
    ok?: boolean;
    message?: string;
  };
  benName?: string | null;
};

export type VerifyBankAccountResult = {
  ok: boolean;
  message: string;
  bankAccountName?: string;
  isNameMatched?: boolean;
};

export type SaveBankAccountPayload = {
  bankAccountNumber: string;
  bankCode: string;
  bankName: string;
  bankAccountName: string;
};

export type SaveBankAccountResult = {
  ok: boolean;
  message: string;
};

function normalizeVietnameseName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function getApiMbUrl(): string {
  const baseUrl = process.env.API_MB_URL;
  if (!baseUrl) {
    throw new Error('Missing API_MB_URL environment variable.');
  }
  return baseUrl.replace(/\/$/, '');
}

export async function verifyBankAccountNameAction(input: {
  bankAccountNumber: string;
  bankCode: string;
}): Promise<VerifyBankAccountResult> {
  try {
    const bankAccountNumber = input.bankAccountNumber.trim();
    const bankCode = input.bankCode.trim();

    if (!bankAccountNumber || !bankCode) {
      return {
        ok: false,
        message:
          'Vui lòng nhập số tài khoản và chọn ngân hàng trước khi kiểm tra.',
      };
    }

    const merchant = await getMerchant();
    const legalName = merchant?.legalName?.trim() ?? '';

    if (!legalName) {
      return {
        ok: false,
        message: 'Không lấy được thông tin pháp lý của merchant để đối chiếu.',
      };
    }

    const response = await fetch(
      `${getApiMbUrl()}/api/v1/get-inquiry-account-name`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditAccount: bankAccountNumber,
          bankCode,
        }),
        cache: 'no-store',
      },
    );

    const data = (await response.json()) as InquiryApiResponse;

    if (!response.ok || data?.result?.ok !== true) {
      return {
        ok: false,
        message: 'Không tìm thấy tài khoản.',
      };
    }

    const benName = String(data.benName ?? '').trim();
    if (!benName) {
      return {
        ok: false,
        message: 'Không tìm thấy tài khoản.',
      };
    }

    const isNameMatched =
      normalizeVietnameseName(benName) === normalizeVietnameseName(legalName);

    return {
      ok: true,
      bankAccountName: benName,
      isNameMatched,
      message: isNameMatched ? 'Tài khoản hợp lệ.' : 'Tài khoản không hợp lệ.',
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Kiểm tra tài khoản thất bại.';

    return {
      ok: false,
      message,
    };
  }
}

export async function saveBankAccountAction(
  payload: SaveBankAccountPayload,
): Promise<SaveBankAccountResult> {
  try {
    const bankAccountNumber = payload.bankAccountNumber.trim();
    const bankCode = payload.bankCode.trim();
    const bankName = payload.bankName.trim();
    const bankAccountName = payload.bankAccountName.trim();

    if (!bankAccountNumber || !bankCode || !bankName || !bankAccountName) {
      return {
        ok: false,
        message: 'Vui lòng điền đầy đủ thông tin tài khoản ngân hàng.',
      };
    }

    const merchant = await getMerchant();
    const legalName = merchant?.legalName?.trim() ?? '';

    if (!legalName) {
      return {
        ok: false,
        message: 'Không lấy được legalName để đối chiếu.',
      };
    }

    const isNameMatched =
      normalizeVietnameseName(bankAccountName) ===
      normalizeVietnameseName(legalName);

    if (!isNameMatched) {
      return {
        ok: false,
        message: 'Tên chủ tài khoản không trùng legalName, không thể lưu.',
      };
    }

    await updateShop({
      bankAccountNumber,
      bankCode,
      bankName,
      bankAccountName,
    });

    revalidatePath('/finance');
    revalidatePath('/settings');

    return {
      ok: true,
      message: 'Đã cập nhật tài khoản ngân hàng.',
    };
  } catch (error) {
    const message = (error as { response?: { data?: { message?: unknown } } })
      ?.response?.data?.message;

    if (Array.isArray(message)) {
      return {
        ok: false,
        message: message.join(', '),
      };
    }

    if (typeof message === 'string') {
      return {
        ok: false,
        message,
      };
    }

    return {
      ok: false,
      message: 'Lưu tài khoản ngân hàng thất bại.',
    };
  }
}
