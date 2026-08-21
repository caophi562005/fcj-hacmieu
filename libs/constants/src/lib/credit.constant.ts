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
  PLATFORM_FEE: 'PLATFORM_FEE',
  TAX_WITHHOLDING: 'TAX_WITHHOLDING',
  WITHDRAWAL: 'WITHDRAWAL',
  REFUND: 'REFUND',
  SYSTEM: 'SYSTEM',
  PRODUCT_PLACEMENT: 'PRODUCT_PLACEMENT',
  OTHER: 'OTHER',
} as const;

export const CreditTransactionSourceEnums = z.enum([
  CreditTransactionSourceValues.ORDER_REVENUE,
  CreditTransactionSourceValues.PLATFORM_FEE,
  CreditTransactionSourceValues.TAX_WITHHOLDING,
  CreditTransactionSourceValues.WITHDRAWAL,
  CreditTransactionSourceValues.REFUND,
  CreditTransactionSourceValues.SYSTEM,
  CreditTransactionSourceValues.PRODUCT_PLACEMENT,
  CreditTransactionSourceValues.OTHER,
]);

export type CreditTransactionSource = z.infer<
  typeof CreditTransactionSourceEnums
>;
