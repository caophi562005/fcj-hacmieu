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
  provinceId: z.number().int().nullable().optional(),
  provinceName: z.string().nullable().optional(),
  districtId: z.number().int().nullable().optional(),
  districtName: z.string().nullable().optional(),
  wardId: z.number().int().nullable().optional(),
  wardName: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});
