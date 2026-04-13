import {
  GenderEnums,
  GroupEnums,
  UserStatusEnums,
} from '@common/constants/user.constant';
import { z } from 'zod';
import { BaseSchema } from '../common/base.schema';

export const UserSchema = BaseSchema.extend({
  email: z.email(),
  username: z.string(),
  phoneNumber: z.string(),
  avatar: z.string(),
  birthday: z.any().nullable(),
  gender: GenderEnums,
  status: UserStatusEnums,
  group: z.array(GroupEnums),
});
