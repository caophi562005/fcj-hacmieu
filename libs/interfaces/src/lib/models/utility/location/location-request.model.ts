import z from 'zod';

export const GetProvincesRequestSchema = z
  .object({ processId: z.uuid().optional() })
  .strict();

export const GetDistrictsRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    provinceId: z.number().int().positive(),
  })
  .strict();

export const GetWardsRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    districtId: z.number().int().positive(),
  })
  .strict();

export type GetProvincesRequest = z.infer<typeof GetProvincesRequestSchema>;
export type GetDistrictsRequest = z.infer<typeof GetDistrictsRequestSchema>;
export type GetWardsRequest = z.infer<typeof GetWardsRequestSchema>;
