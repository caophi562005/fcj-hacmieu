import z from 'zod';
import { BaseSchema } from '../common/base.schema';

export const RoleSchema = BaseSchema.extend({
  name: z.string().max(500),
  description: z.string(),
});
