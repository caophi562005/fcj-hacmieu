import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const BrandSchema = BaseSchema.extend({
  name: z.string().max(500),
  logo: z.string().max(1000),
});

export type Brand = z.infer<typeof BrandSchema>;
