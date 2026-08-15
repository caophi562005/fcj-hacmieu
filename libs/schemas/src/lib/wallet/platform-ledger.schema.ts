import { z } from 'zod';

export const GetPlatformLedgerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  shopId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['createdAt', 'grossAmount', 'commissionFee']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type GetPlatformLedgerListQueryDto = z.infer<
  typeof GetPlatformLedgerListQuerySchema
>;

export const GetPlatformRevenueSummaryQuerySchema = z.object({
  shopId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type GetPlatformRevenueSummaryQueryDto = z.infer<
  typeof GetPlatformRevenueSummaryQuerySchema
>;
