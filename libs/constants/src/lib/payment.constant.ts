import z from 'zod';

export const PaymentMethodValues = {
  COD: 'COD',
  WALLET: 'WALLET',
  ONLINE: 'ONLINE',
} as const;

export const PaymentMethodEnums = z.enum([
  PaymentMethodValues.COD,
  PaymentMethodValues.WALLET,
  PaymentMethodValues.ONLINE,
]);

export const PaymentStatusValues = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export const PaymentStatusEnums = z.enum([
  PaymentStatusValues.PENDING,
  PaymentStatusValues.SUCCESS,
  PaymentStatusValues.FAILED,
  PaymentStatusValues.CANCELLED,
]);

export const RefundStatusValues = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const RefundStatusEnums = z.enum([
  RefundStatusValues.PENDING,
  RefundStatusValues.APPROVED,
  RefundStatusValues.REJECTED,
]);

export const PAYMENT_QUEUE_NAME = 'payment';

export const CANCEL_PAYMENT_JOB_NAME = 'cancel-payment';

export type PaymentMethod = z.infer<typeof PaymentMethodEnums>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnums>;
export type RefundStatus = z.infer<typeof RefundStatusEnums>;
