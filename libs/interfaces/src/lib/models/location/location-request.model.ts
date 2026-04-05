import z from 'zod';

export const GetManyDistrictsRequestSchema = z
  .object({
    provinceId: z.coerce.number().int(),
    processId: z.uuid().optional(),
  })
  .strict();

export const GetManyWardsRequestSchema = z
  .object({
    districtId: z.coerce.number().int(),
    processId: z.uuid().optional(),
  })
  .strict();
