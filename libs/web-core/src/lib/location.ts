import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  DistrictResponse,
  GetDistrictsResponse,
  GetProvincesResponse,
  GetWardsResponse,
  ProvinceResponse,
  WardResponse,
} from '@common/interfaces/models/utility';
import type { AxiosInstance } from 'axios';

export type { DistrictResponse, ProvinceResponse, WardResponse };

export async function fetchProvinces(
  api: AxiosInstance,
): Promise<ProvinceResponse[]> {
  const res = await api.get<ApiResponse<GetProvincesResponse>>(
    '/utility/location/provinces',
    {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    },
  );
  if (res.status === 404) return [];
  return res.data?.data?.provinces ?? [];
}

export async function fetchDistricts(
  api: AxiosInstance,
  provinceId: number,
): Promise<DistrictResponse[]> {
  if (!provinceId) return [];
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

export async function fetchWards(
  api: AxiosInstance,
  districtId: number,
): Promise<WardResponse[]> {
  if (!districtId) return [];
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
