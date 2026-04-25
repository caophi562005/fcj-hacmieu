import {
  GetDistrictsRequest,
  GetDistrictsResponse,
  GetProvincesRequest,
  GetProvincesResponse,
  GetWardsRequest,
  GetWardsResponse,
} from '@common/interfaces/models/utility';
import { Injectable } from '@nestjs/common';
import { LocationStore } from '../src/location.store';

@Injectable()
export class LocationService {
  private readonly store = new LocationStore();

  getProvinces(_data: GetProvincesRequest): GetProvincesResponse {
    return { provinces: this.store.getProvinces() };
  }

  getDistricts(data: GetDistrictsRequest): GetDistrictsResponse {
    return { districts: this.store.getDistricts(data.provinceId) };
  }

  getWards(data: GetWardsRequest): GetWardsResponse {
    return { wards: this.store.getWards(data.districtId) };
  }
}
