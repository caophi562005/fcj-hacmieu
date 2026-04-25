import {
  DistrictResponse,
  ProvinceResponse,
  WardResponse,
} from '@common/interfaces/models/utility';
import districtsJson from '../data/districts.json';
import provincesJson from '../data/provinces.json';
import wardsJson from '../data/wards.json';

export class LocationStore {
  private readonly provinceById = new Map<number, ProvinceResponse>();
  private readonly districtById = new Map<number, DistrictResponse>();
  private readonly wardById = new Map<number, WardResponse>();

  private readonly districtsByProvince = new Map<number, DistrictResponse[]>();
  private readonly wardsByDistrict = new Map<number, WardResponse[]>();

  constructor() {
    const provinces = provincesJson as ProvinceResponse[];
    const districts = districtsJson as DistrictResponse[];
    const wards = wardsJson as WardResponse[];

    for (const p of provinces) {
      this.provinceById.set(p.id, p);
    }

    for (const d of districts) {
      this.districtById.set(d.id, d);
      const arr = this.districtsByProvince.get(d.provinceId) ?? [];
      arr.push(d);
      this.districtsByProvince.set(d.provinceId, arr);
    }

    for (const w of wards) {
      this.wardById.set(w.id, w);
      const arr = this.wardsByDistrict.get(w.districtId) ?? [];
      arr.push(w);
      this.wardsByDistrict.set(w.districtId, arr);
    }
  }

  getProvinces(): ProvinceResponse[] {
    return Array.from(this.provinceById.values());
  }

  getDistricts(provinceId: number): DistrictResponse[] {
    return this.districtsByProvince.get(provinceId) ?? [];
  }

  getWards(districtId: number): WardResponse[] {
    return this.wardsByDistrict.get(districtId) ?? [];
  }

  getProvince(provinceId: number): ProvinceResponse | null {
    return this.provinceById.get(provinceId) ?? null;
  }

  getDistrict(districtId: number): DistrictResponse | null {
    return this.districtById.get(districtId) ?? null;
  }

  getWard(wardId: number): WardResponse | null {
    return this.wardById.get(wardId) ?? null;
  }
}
