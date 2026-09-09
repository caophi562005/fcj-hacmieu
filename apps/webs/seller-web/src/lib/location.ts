import {
  createServerLocationClient,
  type DistrictResponse,
  type ProvinceResponse,
  type WardResponse,
} from '@common/web-core/lib/server-location';
import { createServerApi } from './api';

export type { DistrictResponse, ProvinceResponse, WardResponse };

const sellerLocationClient = createServerLocationClient(createServerApi);
export const { getProvinces, getDistricts, getWards } = sellerLocationClient;
