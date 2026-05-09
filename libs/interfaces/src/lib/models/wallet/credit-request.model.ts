import {
  CreditTransactionSourceEnums,
  CreditTransactionTypeEnums,
} from '@common/constants/credit.constant';
import z from 'zod';

export const GetShopRevenueSummaryRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid(),
    days: z.coerce.number().int().positive().max(90).default(7),
  })
  .strict();

export const GetShopCreditRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid(),
  })
  .strict();

export const AdjustShopCreditRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid(),
    type: CreditTransactionTypeEnums,
    source: CreditTransactionSourceEnums.default('OTHER'),
    referenceId: z.string().optional(),
    amount: z.number().int().positive(),
    description: z.string().min(1).max(255),
  })
  .strict();

export const GetShopCreditTransactionsRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    type: CreditTransactionTypeEnums.optional(),
    source: CreditTransactionSourceEnums.optional(),
  })
  .strict();

export type GetShopCreditRequest = z.infer<typeof GetShopCreditRequestSchema>;
export type AdjustShopCreditRequest = z.infer<
  typeof AdjustShopCreditRequestSchema
>;
export type GetShopCreditTransactionsRequest = z.infer<
  typeof GetShopCreditTransactionsRequestSchema
>;
export type GetShopRevenueSummaryRequest = z.infer<
  typeof GetShopRevenueSummaryRequestSchema
>;
