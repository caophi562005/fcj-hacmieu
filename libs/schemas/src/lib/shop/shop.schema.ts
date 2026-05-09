import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const ShopStatusEnums = z.enum([
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'CLOSED',
]);

export const ShopSchema = BaseSchema.extend({
  merchantId: z.uuid(),
  userId: z.uuid(),
  name: z.string().max(500),
  description: z.string(),
  logo: z.string().max(1000).nullable(),
  banner: z.string().max(1000).nullable(),
  phone: z.string().max(20).nullable(),
  status: ShopStatusEnums,
  pickupAddress: z.string().nullable(),
  returnAddress: z.string().nullable(),
  bankName: z.string().max(255).nullable(),
  bankAccountNumber: z.string().max(50).nullable(),
  bankCode: z.string().max(50).nullable(),
  bankAccountName: z.string().max(255).nullable(),
});

export type Shop = z.infer<typeof ShopSchema>;
