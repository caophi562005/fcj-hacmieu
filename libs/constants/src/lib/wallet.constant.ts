import z from 'zod';

export const WalletTransactionTypeValues = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
} as const;

export const WalletTransactionTypeEnums = z.enum([
  WalletTransactionTypeValues.CREDIT,
  WalletTransactionTypeValues.DEBIT,
]);

export type WalletTransactionType = z.infer<typeof WalletTransactionTypeEnums>;

// ====================================================================================================

export const WalletTransactionSourceValues = {
  ORDER_REWARD: 'ORDER_REWARD',
  REVIEW_REWARD: 'REVIEW_REWARD',
  PROMOTION_GIFT: 'PROMOTION_GIFT',
  REFERRAL: 'REFERRAL',
  TOPUP: 'TOPUP',
  REFUND: 'REFUND',
  ORDER_PAYMENT: 'ORDER_PAYMENT',
  SYSTEM: 'SYSTEM',
  OTHER: 'OTHER',
} as const;

export const WalletTransactionSourceEnums = z.enum([
  WalletTransactionSourceValues.ORDER_REWARD,
  WalletTransactionSourceValues.REVIEW_REWARD,
  WalletTransactionSourceValues.PROMOTION_GIFT,
  WalletTransactionSourceValues.REFERRAL,
  WalletTransactionSourceValues.TOPUP,
  WalletTransactionSourceValues.REFUND,
  WalletTransactionSourceValues.ORDER_PAYMENT,
  WalletTransactionSourceValues.SYSTEM,
  WalletTransactionSourceValues.OTHER,
]);

export type WalletTransactionSource = z.infer<
  typeof WalletTransactionSourceEnums
>;
