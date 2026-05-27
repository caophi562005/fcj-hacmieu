'use server';

import {
  getDistricts,
  getWards,
  type DistrictResponse,
  type WardResponse,
} from '../../lib/location';

export async function loadDistricts(
  provinceId: number,
): Promise<DistrictResponse[]> {
  if (!provinceId) return [];
  return getDistricts(provinceId);
}

export async function loadWards(
  districtId: number,
): Promise<WardResponse[]> {
  if (!districtId) return [];
  return getWards(districtId);
}
