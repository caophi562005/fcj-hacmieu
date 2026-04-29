import { WalletSchema, WalletTransactionSchema } from '@common/schemas/wallet';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const WalletResponseSchema = WalletSchema;

export const WalletTransactionResponseSchema = WalletTransactionSchema;

export const GetMyTransactionsResponseSchema =
  PaginationQueryResponseSchema.extend({
    transactions: z.array(WalletTransactionResponseSchema),
  });

export type WalletResponse = z.infer<typeof WalletResponseSchema>;
export type WalletTransactionResponse = z.infer<
  typeof WalletTransactionResponseSchema
>;
export type GetMyTransactionsResponse = z.infer<
  typeof GetMyTransactionsResponseSchema
>;
