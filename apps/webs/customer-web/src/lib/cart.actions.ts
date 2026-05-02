'use server';

import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  AddCartItemResponse,
  DeleteCartItemResponse,
} from '@common/interfaces/models/order';
import { createServerApi } from './api';

export type AddCartItemInput = {
  productId: string;
  productName: string;
  productImage: string;
  skuId: string;
  skuValue: string;
  shopId: string;
  quantity: number;
};

export type AddCartItemResult =
  | { ok: true; cartCount: number }
  | { ok: false; message: string };

// Server Action: thêm item vào giỏ hàng. Gọi trực tiếp từ client component.
export async function addCartItemAction(
  input: AddCartItemInput,
): Promise<AddCartItemResult> {
  try {
    const api = await createServerApi();
    const res = await api.post<ApiResponse<AddCartItemResponse>>(
      '/order/cart',
      input,
    );
    const cartCount = res.data?.data?.cartCount ?? 0;
    return { ok: true, cartCount };
  } catch (e: unknown) {
    const err = e as {
      response?: { data?: { message?: string }; status?: number };
      message?: string;
    };
    if (err?.response?.status === 401) {
      return { ok: false, message: 'Bạn cần đăng nhập để thêm vào giỏ hàng' };
    }
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Không thể thêm vào giỏ hàng';
    return { ok: false, message };
  }
}

export type DeleteCartItemResult =
  | { ok: true }
  | { ok: false; message: string };

// Server Action: xoá 1 cart item theo cartItemId.
export async function deleteCartItemAction(
  cartItemId: string,
): Promise<DeleteCartItemResult> {
  try {
    const api = await createServerApi();
    await api.delete<ApiResponse<DeleteCartItemResponse>>(
      `/order/cart/${cartItemId}`,
    );
    return { ok: true };
  } catch (e: unknown) {
    const err = e as {
      response?: { data?: { message?: string }; status?: number };
      message?: string;
    };
    if (err?.response?.status === 401) {
      return { ok: false, message: 'Bạn cần đăng nhập' };
    }
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Không thể xoá sản phẩm khỏi giỏ hàng';
    return { ok: false, message };
  }
}
