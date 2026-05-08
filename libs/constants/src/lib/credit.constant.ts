import z from 'zod';

export const CreditTransactionTypeValues = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
} as const;

export const CreditTransactionTypeEnums = z.enum([
  CreditTransactionTypeValues.CREDIT,
  CreditTransactionTypeValues.DEBIT,
]);

export type CreditTransactionType = z.infer<typeof CreditTransactionTypeEnums>;

export const CreditTransactionSourceValues = {
  ORDER_REVENUE: 'ORDER_REVENUE',
  WITHDRAWAL: 'WITHDRAWAL',
  REFUND: 'REFUND',
  SYSTEM: 'SYSTEM',
  OTHER: 'OTHER',
} as const;

export const CreditTransactionSourceEnums = z.enum([
  CreditTransactionSourceValues.ORDER_REVENUE,
  CreditTransactionSourceValues.WITHDRAWAL,
  CreditTransactionSourceValues.REFUND,
  CreditTransactionSourceValues.SYSTEM,
  CreditTransactionSourceValues.OTHER,
]);

export type CreditTransactionSource = z.infer<
  typeof CreditTransactionSourceEnums
>;
