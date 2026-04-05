import z from 'zod';

export const GetManyProvincesResponseSchema = z.array(
  z.object({
    id: z.number().int(),
    name: z.string(),
  })
);

export const GetManyDistrictsResponseSchema = z.array(
  z.object({
    id: z.number().int(),
    name: z.string(),
    provinceId: z.coerce.number().int(),
  })
);

export const GetManyWardsResponseSchema = z.array(
  z.object({
    id: z.number().int(),
    name: z.string(),
    districtId: z.number().int(),
    provinceId: z.coerce.number().int(),
  })
);
