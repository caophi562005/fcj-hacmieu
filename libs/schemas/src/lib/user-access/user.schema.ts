import { GenderEnums, UserStatusEnums } from '@common/constants/user.constant';
import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const UserSchema = BaseSchema.extend({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  username: z.string(),
  phoneNumber: z.string(),
  avatar: z.string(),
  birthday: z.any().nullable(),
  gender: GenderEnums,
  status: UserStatusEnums,

  roleId: z.string(),
  roleName: z.string(),
});
