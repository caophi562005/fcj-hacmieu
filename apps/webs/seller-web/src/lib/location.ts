import type { Response as ApiResponse } from '@common/interfaces/models/common/response.model';
import type {
  DistrictResponse,
  GetDistrictsResponse,
  GetProvincesResponse,
  GetWardsResponse,
  ProvinceResponse,
  WardResponse,
} from '@common/interfaces/models/utility';
import { cache } from 'react';
import { createServerApi } from './api';

export type { DistrictResponse, ProvinceResponse, WardResponse };

const _getProvincesCached = cache(async (): Promise<ProvinceResponse[]> => {
  const api = await createServerApi();
  const res = await api.get<ApiResponse<GetProvincesResponse>>(
    '/utility/location/provinces',
    { validateStatus: (s) => (s >= 200 && s < 300) || s === 404 },
  );
  if (res.status === 404) return [];
  return res.data?.data?.provinces ?? [];
});

const _getDistrictsCached = cache(
  async (provinceId: number): Promise<DistrictResponse[]> => {
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
  },
);

const _getWardsCached = cache(
  async (districtId: number): Promise<WardResponse[]> => {
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
  },
);

export function getProvinces(): Promise<ProvinceResponse[]> {
  return _getProvincesCached();
}

export function getDistricts(provinceId: number): Promise<DistrictResponse[]> {
  if (!provinceId) return Promise.resolve([]);
  return _getDistrictsCached(provinceId);
}

export function getWards(districtId: number): Promise<WardResponse[]> {
  if (!districtId) return Promise.resolve([]);
  return _getWardsCached(districtId);
}
