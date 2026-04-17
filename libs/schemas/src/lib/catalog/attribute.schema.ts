import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const AttributeSchema = BaseSchema.extend({
  name: z.string(),
  url: z.url().optional(),
});

export type Attribute = z.infer<typeof AttributeSchema>;
