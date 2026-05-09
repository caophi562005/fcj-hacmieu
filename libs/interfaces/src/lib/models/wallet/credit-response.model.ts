import { CreditSchema, CreditTransactionSchema } from '@common/schemas/wallet';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const CreditResponseSchema = CreditSchema;

export const CreditTransactionResponseSchema = CreditTransactionSchema;

export const ShopRevenueDayPointSchema = z.object({
  date: z.string(),
  amount: z.number().int(),
});

export const GetShopRevenueSummaryResponseSchema = z.object({
  days: z.number().int().positive(),
  totalRevenue: z.number().int(),
  points: z.array(ShopRevenueDayPointSchema),
});

export const GetShopCreditTransactionsResponseSchema =
  PaginationQueryResponseSchema.extend({
    transactions: z.array(CreditTransactionResponseSchema),
  });

export type CreditResponse = z.infer<typeof CreditResponseSchema>;
export type CreditTransactionResponse = z.infer<
  typeof CreditTransactionResponseSchema
>;
export type GetShopCreditTransactionsResponse = z.infer<
  typeof GetShopCreditTransactionsResponseSchema
>;
export type ShopRevenueDayPoint = z.infer<typeof ShopRevenueDayPointSchema>;
export type GetShopRevenueSummaryResponse = z.infer<
  typeof GetShopRevenueSummaryResponseSchema
>;
