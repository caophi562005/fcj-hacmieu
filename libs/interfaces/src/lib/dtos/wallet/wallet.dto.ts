import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  AdjustWalletRequestSchema,
  GetMyTransactionsRequestSchema,
  GetMyTransactionsResponseSchema,
  WalletResponseSchema,
} from '@common/interfaces/models/wallet';
import { createZodDto } from 'nestjs-zod';

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

export class GetMyTransactionsResponseDto extends createZodDto(
  ResponseSchema(GetMyTransactionsResponseSchema),
) {}
