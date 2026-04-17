import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const SKUSchema = BaseSchema.extend({
  value: z.string(),
  price: z.number(),
  stock: z.number(),
  image: z.string().optional(),
  productId: z.string(),
});

export type SKU = z.infer<typeof SKUSchema>;
