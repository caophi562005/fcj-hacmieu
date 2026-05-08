import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  AdjustShopCreditRequestSchema,
  AdjustWalletRequestSchema,
  CreditResponseSchema,
  GetMyTransactionsRequestSchema,
  GetMyTransactionsResponseSchema,
  GetShopCreditRequestSchema,
  GetShopCreditTransactionsRequestSchema,
  GetShopCreditTransactionsResponseSchema,
  GetShopRevenueSummaryRequestSchema,
  GetShopRevenueSummaryResponseSchema,
  WalletResponseSchema,
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

export class AdjustWalletRequestDto extends createZodDto(
  AdjustWalletRequestSchema.omit({ processId: true, userId: true }),
) {}

export class GetMyTransactionsRequestDto extends createZodDto(
  GetMyTransactionsRequestSchema.omit({ processId: true, userId: true }),
) {}

// =====================================================================

export class WalletResponseDto extends createZodDto(
  ResponseSchema(WalletResponseSchema),
) {}

export class CreditResponseDto extends createZodDto(
  ResponseSchema(CreditResponseSchema),
) {}

export class GetMyTransactionsResponseDto extends createZodDto(
  ResponseSchema(GetMyTransactionsResponseSchema),
) {}

export class GetShopCreditTransactionsResponseDto extends createZodDto(
  ResponseSchema(GetShopCreditTransactionsResponseSchema),
) {}

export class GetShopRevenueSummaryResponseDto extends createZodDto(
  ResponseSchema(GetShopRevenueSummaryResponseSchema),
) {}
