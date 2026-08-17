import {
  SellerSettlementHistorySchema,
  SellerSettlementSchema,
} from '@common/schemas/wallet';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const SellerSettlementResponseSchema = SellerSettlementSchema;

export const SellerSettlementDetailResponseSchema =
  SellerSettlementSchema.extend({
    histories: z.array(SellerSettlementHistorySchema),
  });

export const GetSellerSettlementsResponseSchema =
  PaginationQueryResponseSchema.extend({
    settlements: z.array(SellerSettlementResponseSchema),
  });

export const GetSellerSettlementSummaryResponseSchema = z.object({
  pendingAmount: z.number().int().nonnegative(),
  pendingCount: z.number().int().nonnegative(),
  dueWithin24HoursAmount: z.number().int().nonnegative(),
  dueWithin24HoursCount: z.number().int().nonnegative(),
  heldAmount: z.number().int().nonnegative(),
  heldCount: z.number().int().nonnegative(),
  failedAmount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  settledAmount: z.number().int().nonnegative(),
  settledCount: z.number().int().nonnegative(),
  nextAvailableAt: z.any().nullable(),
  nextAvailableAmount: z.number().int().nonnegative(),
});

export type SellerSettlementResponse = z.infer<
  typeof SellerSettlementResponseSchema
>;
export type SellerSettlementDetailResponse = z.infer<
  typeof SellerSettlementDetailResponseSchema
>;
export type GetSellerSettlementsResponse = z.infer<
  typeof GetSellerSettlementsResponseSchema
>;
export type GetSellerSettlementSummaryResponse = z.infer<
  typeof GetSellerSettlementSummaryResponseSchema
>;
