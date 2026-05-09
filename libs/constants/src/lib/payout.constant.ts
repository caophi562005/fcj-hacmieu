import z from 'zod';

export const PayoutStatusValues = {
  PENDING: 'PENDING',
  TRANSFERRED: 'TRANSFERRED',
  REJECTED: 'REJECTED',
} as const;

export const PayoutStatusEnums = z.enum([
  PayoutStatusValues.PENDING,
  PayoutStatusValues.TRANSFERRED,
  PayoutStatusValues.REJECTED,
]);

export type PayoutStatus = z.infer<typeof PayoutStatusEnums>;
