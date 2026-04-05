import { z } from 'zod';

export const AddressSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  address: z.string(),
  ward: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  isDefault: z.boolean().default(false),
  createdAt: z.any(),
  updatedAt: z.any(),
});
