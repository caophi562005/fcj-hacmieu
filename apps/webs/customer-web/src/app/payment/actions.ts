'use server';

import axios from 'axios';
import {
  getDistricts,
  getWards,
  type DistrictResponse,
  type WardResponse,
} from '../../lib/location';

export async function loadPaymentDistricts(
  provinceId: number,
): Promise<DistrictResponse[]> {
  return provinceId ? getDistricts(provinceId) : [];
}

export async function loadPaymentWards(
  districtId: number,
): Promise<WardResponse[]> {
  return districtId ? getWards(districtId) : [];
}

export type ShippingQuoteInput = {
  destinationDistrictId: number;
  destinationWardCode: string;
  groups: Array<{
    shopId: string;
    fromDistrictId: number;
    fromWardCode: string;
    weight: number;
  }>;
};

export type ShippingQuoteResult =
  | { ok: true; total: number; byShop: Record<string, number> }
  | { ok: false; message: string };

export async function quoteShippingAction(
  input: ShippingQuoteInput,
): Promise<ShippingQuoteResult> {
  if (!input.destinationDistrictId || !input.destinationWardCode) {
    return { ok: false, message: 'Vui lòng chọn đầy đủ địa chỉ nhận hàng.' };
  }

  if (
    input.groups.some(
      (group) =>
        !Number.isInteger(group.fromDistrictId) ||
        group.fromDistrictId <= 0 ||
        !group.fromWardCode.trim() ||
        group.fromWardCode.trim() === '0',
    )
  ) {
    return {
      ok: false,
      message:
        'Có cửa hàng chưa cập nhật đầy đủ địa chỉ lấy hàng. Vui lòng liên hệ cửa hàng để được hỗ trợ.',
    };
  }

  const token = process.env.GHN_API_KEY;
  const shopId = process.env.GHN_SHOP_ID;
  if (!token || !shopId) {
    return { ok: false, message: 'Thiếu cấu hình GHN trên máy chủ.' };
  }

  const baseUrl =
    process.env.GHN_API_BASE_URL ??
    'https://dev-online-gateway.ghn.vn/shiip/public-api';

  try {
    const fees = await Promise.all(
      input.groups.map(async (group) => {
        const { data } = await axios.post(
          `${baseUrl}/v2/shipping-order/fee`,
          {
            service_type_id: 2,
            from_district_id: group.fromDistrictId,
            from_ward_code: group.fromWardCode,
            to_district_id: input.destinationDistrictId,
            to_ward_code: input.destinationWardCode,
            weight: Math.max(1, Math.floor(group.weight)),
            insurance_value: 0,
          },
          { headers: { Token: token, ShopId: shopId } },
        );
        return { shopId: group.shopId, fee: Number(data?.data?.total ?? 0) };
      }),
    );

    const byShop: Record<string, number> = {};
    for (const item of fees) {
      byShop[item.shopId] = (byShop[item.shopId] ?? 0) + item.fee;
    }
    return {
      ok: true,
      byShop,
      total: Object.values(byShop).reduce((sum, fee) => sum + fee, 0),
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message
      : undefined;
    return { ok: false, message: message || 'Không thể tính phí GHN.' };
  }
}
