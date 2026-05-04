import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  DistrictResponse,
  GetDistrictsResponse,
  GetProvincesResponse,
  GetWardsResponse,
  ProvinceResponse,
  WardResponse,
} from '@common/interfaces/models/utility';
import { createServerApi } from './api';

export type { ProvinceResponse, DistrictResponse, WardResponse };

export async function getProvinces(): Promise<ProvinceResponse[]> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetProvincesResponse>>(
    '/utility/location/provinces',
    { validateStatus: (s) => (s >= 200 && s < 300) || s === 404 },
  );
  if (res.status === 404) return [];
  return res.data?.data?.provinces ?? [];
}

export async function getDistricts(
  provinceId: number,
): Promise<DistrictResponse[]> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetDistrictsResponse>>(
    '/utility/location/districts',
    {
      params: { provinceId },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return [];
  return res.data?.data?.districts ?? [];
}

export async function getWards(districtId: number): Promise<WardResponse[]> {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetWardsResponse>>(
    '/utility/location/wards',
    {
      params: { districtId },
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return [];
  return res.data?.data?.wards ?? [];
}
