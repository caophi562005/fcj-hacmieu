import { z } from 'zod';

export const AddressSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  address: z.string(),
  ward: z.string().nullable(),
  district: z.string().nullable(),
  province: z.string().nullable(),
  createdAt: z.any(),
  updatedAt: z.any(),
});
