'use server';

import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from '@common/interfaces/models/order';
import { createServerApi } from './api';

export type CreateOrderInput = Omit<CreateOrderRequest, 'processId' | 'userId'>;

export type CreateOrderResult =
  | { ok: true; orderIds: string[] }
  | { ok: false; message: string };

export async function createOrderAction(
  payload: CreateOrderInput,
): Promise<CreateOrderResult> {
  try {
    const api = await createServerApi();
    const { data } = await api.post<ApiResponse<CreateOrderResponse>>(
      '/order/order',
      payload,
    );

    const orderIds = data?.data?.orders?.map((order) => order.id) ?? [];
    return { ok: true, orderIds };
  } catch (error: unknown) {
    const err = error as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };

    if (err?.response?.status === 401) {
      return { ok: false, message: 'Bạn cần đăng nhập để đặt hàng.' };
    }

    return {
      ok: false,
      message:
        err?.response?.data?.message ?? err?.message ?? 'Không thể tạo đơn hàng.',
    };
  }
}
