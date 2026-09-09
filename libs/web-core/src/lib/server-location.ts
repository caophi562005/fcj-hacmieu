import type { AxiosInstance } from 'axios';
import { cache } from 'react';
import { fetchDistricts, fetchProvinces, fetchWards } from './location';

export type {
  DistrictResponse,
  ProvinceResponse,
  WardResponse,
} from './location';

export function createServerLocationClient(
  createServerApi: () => Promise<AxiosInstance>,
) {
  const getProvinces = cache(async () => {
    const api = await createServerApi();
    return fetchProvinces(api);
  });

  const getDistricts = cache(async (provinceId: number) => {
    if (!provinceId) return [];
    const api = await createServerApi();
    return fetchDistricts(api, provinceId);
  });

  const getWards = cache(async (districtId: number) => {
    if (!districtId) return [];
    const api = await createServerApi();
    return fetchWards(api, districtId);
  });

  return { getProvinces, getDistricts, getWards };
}
