'use server';

import { getCategoriesByParent, type CategoryOption } from '../../../lib/catalog';
import {
  getDistricts,
  getWards,
  type DistrictResponse,
  type WardResponse,
} from '../../../lib/location';

export async function loadChildCategories(
  parentCategoryId: string,
): Promise<CategoryOption[]> {
  if (!parentCategoryId) return [];
  return getCategoriesByParent(parentCategoryId);
}

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
