import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  AdjustShopCreditRequestSchema,
  CreditResponseSchema,
  GetShopCreditRequestSchema,
  GetShopCreditTransactionsRequestSchema,
  GetShopCreditTransactionsResponseSchema,
  GetShopRevenueSummaryRequestSchema,
  GetShopRevenueSummaryResponseSchema,
} from '@common/interfaces/models/wallet';
import { createZodDto } from 'nestjs-zod';

export class GetShopCreditRequestDto extends createZodDto(
  GetShopCreditRequestSchema.omit({ processId: true, shopId: true }),
) {}

export class AdjustShopCreditRequestDto extends createZodDto(
  AdjustShopCreditRequestSchema.omit({ processId: true, shopId: true }),
) {}

export class GetShopCreditTransactionsRequestDto extends createZodDto(
  GetShopCreditTransactionsRequestSchema.omit({
    processId: true,
    shopId: true,
  }),
) {}

export class GetShopRevenueSummaryRequestDto extends createZodDto(
  GetShopRevenueSummaryRequestSchema.omit({ processId: true, shopId: true }),
) {}

// =====================================================================

export class CreditResponseDto extends createZodDto(
  ResponseSchema(CreditResponseSchema),
) {}

export class GetShopCreditTransactionsResponseDto extends createZodDto(
  ResponseSchema(GetShopCreditTransactionsResponseSchema),
) {}

export class GetShopRevenueSummaryResponseDto extends createZodDto(
  ResponseSchema(GetShopRevenueSummaryResponseSchema),
) {}
