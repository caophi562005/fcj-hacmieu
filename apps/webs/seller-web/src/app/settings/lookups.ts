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
  return provinceId ? getDistricts(provinceId) : [];
}

export async function loadWards(districtId: number): Promise<WardResponse[]> {
  return districtId ? getWards(districtId) : [];
}
