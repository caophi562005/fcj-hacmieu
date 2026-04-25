import z from 'zod';

export const ProvinceResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const DistrictResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  provinceId: z.number(),
});

export const WardResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  districtId: z.number(),
  provinceId: z.number(),
});

export const GetProvincesResponseSchema = z.object({
  provinces: z.array(ProvinceResponseSchema),
});

export const GetDistrictsResponseSchema = z.object({
  districts: z.array(DistrictResponseSchema),
});

export const GetWardsResponseSchema = z.object({
  wards: z.array(WardResponseSchema),
});

export type ProvinceResponse = z.infer<typeof ProvinceResponseSchema>;
export type DistrictResponse = z.infer<typeof DistrictResponseSchema>;
export type WardResponse = z.infer<typeof WardResponseSchema>;
export type GetProvincesResponse = z.infer<typeof GetProvincesResponseSchema>;
export type GetDistrictsResponse = z.infer<typeof GetDistrictsResponseSchema>;
export type GetWardsResponse = z.infer<typeof GetWardsResponseSchema>;
