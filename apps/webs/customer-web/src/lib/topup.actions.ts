'use server';

import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import { createServerApi } from './api';

export type TopupResult =
  | { ok: true; paymentId: string }
  | { ok: false; message: string };

export async function createTopupAction(amount: number): Promise<TopupResult> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<ApiResponse<{ id: string }>>(
      '/payment/payment/topup',
      { amount },
    );
    return { ok: true, paymentId: data.data.id };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      ok: false,
      message: err?.response?.data?.message ?? 'Không thể tạo giao dịch nạp xu',
    };
  }
}
