import { z } from 'zod';

export const GenderValues = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export const GenderEnums = z.enum([
  GenderValues.MALE,
  GenderValues.FEMALE,
  GenderValues.OTHER,
]);

export const UserStatusValues = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const;

export const UserStatusEnums = z.enum([
  UserStatusValues.ACTIVE,
  UserStatusValues.INACTIVE,
  UserStatusValues.BLOCKED,
]);

export const DefaultRoleNameValues = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
} as const;

export const DefaultRoleNameEnums = z.enum([
  DefaultRoleNameValues.CUSTOMER,
  DefaultRoleNameValues.SELLER,
  DefaultRoleNameValues.MANAGER,
  DefaultRoleNameValues.ADMIN,
]);

export const VerificationCodeValues = {
  REGISTER: 'REGISTER',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
} as const;

export const VerificationCodeEnums = z.enum([
  VerificationCodeValues.REGISTER,
  VerificationCodeValues.CHANGE_PASSWORD,
]);

export type VerificationCode = z.infer<typeof VerificationCodeEnums>;
export type DefaultRoleName = z.infer<typeof DefaultRoleNameEnums>;
