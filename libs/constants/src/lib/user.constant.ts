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

// ====================================================================================================

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

// ====================================================================================================

export const GroupValues = {
  CUSTOMER: 'CUSTOMER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
} as const;

export const GroupEnums = z.enum([
  GroupValues.CUSTOMER,
  GroupValues.SELLER,
  GroupValues.ADMIN,
]);

export type GroupType = z.infer<typeof GroupEnums>;
