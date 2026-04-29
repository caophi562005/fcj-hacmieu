import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  ClaimPromotionRequestSchema,
  GetMyVouchersRequestSchema,
  GetMyVouchersResponseSchema,
  PromotionRedemptionResponseSchema,
} from '@common/interfaces/models/promotion';
import { createZodDto } from 'nestjs-zod';

export class ClaimPromotionRequestDto extends createZodDto(
  ClaimPromotionRequestSchema.omit({ processId: true, userId: true }),
) {}

export class GetMyVouchersRequestDto extends createZodDto(
  GetMyVouchersRequestSchema.omit({ processId: true, userId: true }),
) {}

// =====================================================================

export class PromotionRedemptionResponseDto extends createZodDto(
  ResponseSchema(PromotionRedemptionResponseSchema),
) {}

export class GetMyVouchersResponseDto extends createZodDto(
  ResponseSchema(GetMyVouchersResponseSchema),
) {}
