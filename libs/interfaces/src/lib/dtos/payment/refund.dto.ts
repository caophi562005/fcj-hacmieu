import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  GetManyRefundsRequestSchema,
  GetManyRefundsResponseSchema,
  GetRefundRequestSchema,
  RefundResponseSchema,
  UpdateRefundStatusRequestSchema,
  CreateRefundRequestSchema,
} from '@common/interfaces/models/payment';
import { createZodDto } from 'nestjs-zod';

export class GetManyRefundsRequestDto extends createZodDto(
  GetManyRefundsRequestSchema.omit({ processId: true }),
) {}

export class GetRefundRequestDto extends createZodDto(
  GetRefundRequestSchema.omit({ processId: true }),
) {}

export class CreateRefundRequestDto extends createZodDto(
  CreateRefundRequestSchema.omit({ processId: true, createdById: true }),
) {}

export class UpdateRefundStatusRequestDto extends createZodDto(
  UpdateRefundStatusRequestSchema.omit({ processId: true }),
) {}

// ===========================================================================================

export class GetManyRefundsResponseDto extends createZodDto(
  ResponseSchema(GetManyRefundsResponseSchema),
) {}

export class RefundResponseDto extends createZodDto(
  ResponseSchema(RefundResponseSchema),
) {}
