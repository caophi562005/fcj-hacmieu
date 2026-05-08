import {
  CreditTransactionSourceEnums,
  CreditTransactionTypeEnums,
} from '@common/constants/credit.constant';
import {
  WalletTransactionSourceEnums,
  WalletTransactionTypeEnums,
} from '@common/constants/wallet.constant';
import z from 'zod';

export const WalletSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  balance: z.number().int(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const WalletTransactionSchema = z.object({
  id: z.uuid(),
  walletId: z.uuid(),
  userId: z.uuid(),
  type: WalletTransactionTypeEnums,
  source: WalletTransactionSourceEnums,
  referenceId: z.string().nullable(),
  amount: z.number().int().positive(),
  balanceAfter: z.number().int(),
  description: z.string(),
  createdAt: z.any(),
});

export const CreditSchema = z.object({
  id: z.uuid(),
  shopId: z.uuid(),
  balance: z.number().int(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const CreditTransactionSchema = z.object({
  id: z.uuid(),
  creditId: z.uuid(),
  shopId: z.uuid(),
  type: CreditTransactionTypeEnums,
  source: CreditTransactionSourceEnums,
  referenceId: z.string().nullable(),
  amount: z.number().int().positive(),
  balanceAfter: z.number().int(),
  description: z.string(),
  createdAt: z.any(),
});
