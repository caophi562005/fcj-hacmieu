import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const CategorySchema = BaseSchema.extend({
  name: z.string(),
  logo: z.string(),
  parentCategoryId: z.uuid().nullable(),
});

export type Category = z.infer<typeof CategorySchema>;
