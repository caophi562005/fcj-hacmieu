import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  CreateShopRequest,
  MerchantResponse,
  ShopResponse,
  UpdateShopRequest,
} from '@common/interfaces/models/shop';
import { createServerApi } from './api';

// BFF inject `processId`, `merchantId` (cho create), `createdById/updatedById`
// (server lấy từ JWT). Client chỉ cung cấp các trường nghiệp vụ.
export type CreateShopPayload = Omit<
  CreateShopRequest,
  'processId' | 'createdById' | 'merchantId'
>;

export type UpdateShopPayload = Omit<
  UpdateShopRequest,
  'id' | 'processId' | 'updatedById' | 'merchantId'
>;

export async function getMerchant(): Promise<MerchantResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<MerchantResponse>>('/shop/merchant', {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404 || s === 400,
  });
  if (res.status === 404 || res.status === 400) return null;
  return res.data?.data ?? null;
}

export async function getShop(): Promise<ShopResponse | null> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<ShopResponse>>('/shop/shop', {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404 || s === 400,
  });
  if (res.status === 404 || res.status === 400) return null;
  return res.data?.data ?? null;
}

export async function createShop(
  payload: CreateShopPayload,
): Promise<ShopResponse> {
  const api = await createServerApi();
  // BFF override `merchantId` từ UserData; nhưng DTO validate yêu cầu UUID hợp
  // lệ trong body → server action sẽ điền merchantId thực trước khi gọi.
  const { data } = await api.post<ApiResponse<ShopResponse>>(
    '/shop/shop',
    payload,
  );
  if (!data?.data) throw new Error('Tạo shop thất bại.');
  return data.data;
}

export async function updateShop(
  payload: UpdateShopPayload,
): Promise<ShopResponse> {
  const api = await createServerApi();
  const { data } = await api.put<ApiResponse<ShopResponse>>(
    '/shop/shop',
    payload,
  );
  if (!data?.data) throw new Error('Cập nhật shop thất bại.');
  return data.data;
}
