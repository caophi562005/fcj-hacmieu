import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const ShopSchema = BaseSchema.extend({
  ownerId: z.uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(''),
  logo: z.url().optional(),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  rating: z.number().default(0),
  isOpen: z.boolean().default(true),
});
