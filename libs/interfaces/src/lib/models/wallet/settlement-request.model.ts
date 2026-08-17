import z from 'zod';
import {
  SellerSettlementActionEnums,
  SellerSettlementActionValues,
  SellerSettlementStatusEnums,
} from '@common/constants/settlement.constant';

export const CreateSellerSettlementRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    orderId: z.uuid(),
    shopId: z.uuid(),
    grossAmount: z.number().int().nonnegative(),
    commissionRate: z.number().nonnegative(),
    commissionFee: z.number().int().nonnegative(),
    taxRate: z.number().nonnegative(),
    taxWithheld: z.number().int().nonnegative(),
    netSellerAmount: z.number().int().nonnegative(),
    completedAt: z.iso.datetime(),
  })
  .strict();

export type CreateSellerSettlementRequest = z.infer<
  typeof CreateSellerSettlementRequestSchema
>;

const OptionalDateTimeSchema = z.iso.datetime().optional();

export const GetSellerSettlementSummaryRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid().optional(),
  })
  .strict();

export const GetSellerSettlementsRequestBaseSchema = z
  .object({
    processId: z.uuid().optional(),
    shopId: z.uuid().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    settlementId: z.uuid().optional(),
    orderId: z.uuid().optional(),
    status: SellerSettlementStatusEnums.optional(),
    completedFrom: OptionalDateTimeSchema,
    completedTo: OptionalDateTimeSchema,
    availableFrom: OptionalDateTimeSchema,
    availableTo: OptionalDateTimeSchema,
    minAmount: z.coerce.number().int().nonnegative().optional(),
    maxAmount: z.coerce.number().int().nonnegative().optional(),
    sortBy: z
      .enum(['availableAt', 'completedAt', 'netSellerAmount', 'createdAt'])
      .default('availableAt'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  })
  .strict();

export const GetSellerSettlementsRequestSchema =
  GetSellerSettlementsRequestBaseSchema.refine(
    (data) =>
      data.minAmount === undefined ||
      data.maxAmount === undefined ||
      data.minAmount <= data.maxAmount,
    { message: 'minAmount must be less than or equal to maxAmount' },
  );

export const GetSellerSettlementByIdRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    settlementId: z.uuid(),
    shopId: z.uuid().optional(),
  })
  .strict();

export const UpdateSellerSettlementStatusRequestBaseSchema = z
  .object({
    processId: z.uuid().optional(),
    settlementId: z.uuid(),
    action: SellerSettlementActionEnums,
    reason: z.string().trim().min(3).max(1000).optional(),
    actorId: z.string().trim().min(1).max(255),
  })
  .strict();

export const UpdateSellerSettlementStatusRequestSchema =
  UpdateSellerSettlementStatusRequestBaseSchema.superRefine((data, ctx) => {
    if (
      (data.action === SellerSettlementActionValues.HOLD ||
        data.action === SellerSettlementActionValues.CANCEL) &&
      !data.reason
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['reason'],
        message: 'A reason is required for HOLD and CANCEL actions',
      });
    }
  });

export type GetSellerSettlementSummaryRequest = z.infer<
  typeof GetSellerSettlementSummaryRequestSchema
>;
export type GetSellerSettlementsRequest = z.infer<
  typeof GetSellerSettlementsRequestSchema
>;
export type GetSellerSettlementByIdRequest = z.infer<
  typeof GetSellerSettlementByIdRequestSchema
>;
export type UpdateSellerSettlementStatusRequest = z.infer<
  typeof UpdateSellerSettlementStatusRequestSchema
>;
