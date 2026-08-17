import z from 'zod';

export const SellerSettlementStatusValues = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SETTLED: 'SETTLED',
  HELD: 'HELD',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const;

export const SellerSettlementStatusEnums = z.enum([
  SellerSettlementStatusValues.PENDING,
  SellerSettlementStatusValues.PROCESSING,
  SellerSettlementStatusValues.SETTLED,
  SellerSettlementStatusValues.HELD,
  SellerSettlementStatusValues.CANCELLED,
  SellerSettlementStatusValues.FAILED,
]);

export const SellerSettlementActionValues = {
  HOLD: 'HOLD',
  RELEASE: 'RELEASE',
  CANCEL: 'CANCEL',
} as const;

export const SellerSettlementActionEnums = z.enum([
  SellerSettlementActionValues.HOLD,
  SellerSettlementActionValues.RELEASE,
  SellerSettlementActionValues.CANCEL,
]);

export type SellerSettlementStatusType = z.infer<
  typeof SellerSettlementStatusEnums
>;
export type SellerSettlementActionType = z.infer<
  typeof SellerSettlementActionEnums
>;
