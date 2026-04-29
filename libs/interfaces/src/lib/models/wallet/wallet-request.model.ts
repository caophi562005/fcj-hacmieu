import {
  WalletTransactionSourceEnums,
  WalletTransactionTypeEnums,
} from '@common/constants/wallet.constant';
import z from 'zod';

export const GetMyWalletRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    userId: z.uuid(),
  })
  .strict();

export const AdjustWalletRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    userId: z.uuid(),
    type: WalletTransactionTypeEnums,
    source: WalletTransactionSourceEnums.default('OTHER'),
    referenceId: z.string().optional(),
    amount: z.number().int().positive(),
    description: z.string().min(1).max(255),
  })
  .strict();

export const GetMyTransactionsRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    userId: z.uuid(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    type: WalletTransactionTypeEnums.optional(),
    source: WalletTransactionSourceEnums.optional(),
  })
  .strict();

export type GetMyWalletRequest = z.infer<typeof GetMyWalletRequestSchema>;
export type AdjustWalletRequest = z.infer<typeof AdjustWalletRequestSchema>;
export type GetMyTransactionsRequest = z.infer<
  typeof GetMyTransactionsRequestSchema
>;
