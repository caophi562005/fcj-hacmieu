import {
  fetchDistricts,
  fetchProvinces,
  fetchWards,
} from '@common/web-core/lib/location';
import { cache } from 'react';
import { createServerApi } from './api';

export type {
  DistrictResponse,
  ProvinceResponse,
  WardResponse,
} from '@common/web-core/lib/location';

export const getProvinces = cache(async () => {
  const api = await createServerApi();
  return fetchProvinces(api);
});

export const getDistricts = cache(async (provinceId: number) => {
  if (!provinceId) return [];
  const api = await createServerApi();
  return fetchDistricts(api, provinceId);
});

export const getWards = cache(async (districtId: number) => {
  if (!districtId) return [];
  const api = await createServerApi();
  return fetchWards(api, districtId);
});
