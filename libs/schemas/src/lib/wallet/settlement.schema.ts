import {
  SellerSettlementActionEnums,
  SellerSettlementStatusEnums,
} from '@common/constants/settlement.constant';
import z from 'zod';

export const SellerSettlementSchema = z.object({
  id: z.uuid(),
  orderId: z.uuid(),
  shopId: z.uuid(),
  creditId: z.uuid().nullable(),
  grossAmount: z.number().int().nonnegative(),
  commissionRate: z.number().nonnegative(),
  commissionFee: z.number().int().nonnegative(),
  taxRate: z.number().nonnegative(),
  taxWithheld: z.number().int().nonnegative(),
  netSellerAmount: z.number().int().nonnegative(),
  status: SellerSettlementStatusEnums,
  completedAt: z.any(),
  availableAt: z.any(),
  processingStartedAt: z.any().nullable(),
  settledAt: z.any().nullable(),
  heldAt: z.any().nullable(),
  heldBy: z.string().nullable(),
  holdReason: z.string().nullable(),
  releasedAt: z.any().nullable(),
  releasedBy: z.string().nullable(),
  cancelledAt: z.any().nullable(),
  cancelledBy: z.string().nullable(),
  cancelReason: z.string().nullable(),
  attemptCount: z.number().int().nonnegative(),
  lastError: z.string().nullable(),
  version: z.number().int().nonnegative(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const SellerSettlementHistorySchema = z.object({
  id: z.uuid(),
  settlementId: z.uuid(),
  action: SellerSettlementActionEnums,
  fromStatus: SellerSettlementStatusEnums,
  toStatus: SellerSettlementStatusEnums,
  reason: z.string().nullable(),
  actorId: z.string(),
  createdAt: z.any(),
});
