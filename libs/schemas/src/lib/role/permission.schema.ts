import { HttpMethodEnums } from '@common/constants/http-method.constant';
import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const PermissionSchema = BaseSchema.extend({
  name: z.string().max(500),
  description: z.string(),
  module: z.string().max(500),
  path: z.string().max(1000),
  method: HttpMethodEnums,
});
