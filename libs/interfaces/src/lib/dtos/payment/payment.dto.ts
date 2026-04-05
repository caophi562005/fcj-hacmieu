import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  GetManyPaymentsRequestSchema,
  GetManyPaymentsResponseSchema,
  GetPaymentRequestSchema,
  GetPaymentResponseSchema,
  PaymentResponseSchema,
  UpdatePaymentStatusRequestSchema,
} from '@common/interfaces/models/payment';
import { createZodDto } from 'nestjs-zod';

export class GetManyPaymentsRequestDto extends createZodDto(
  GetManyPaymentsRequestSchema.omit({ processId: true })
) {}

export class GetPaymentRequestDto extends createZodDto(
  GetPaymentRequestSchema.omit({ processId: true })
) {}

export class UpdatePaymentStatusRequestDto extends createZodDto(
  UpdatePaymentStatusRequestSchema.omit({ processId: true })
) {}

// ===========================================================================================

export class GetManyPaymentsResponseDto extends createZodDto(
  ResponseSchema(GetManyPaymentsResponseSchema)
) {}

export class GetPaymentResponseDto extends createZodDto(
  ResponseSchema(GetPaymentResponseSchema)
) {}

export class PaymentResponseDto extends createZodDto(
  ResponseSchema(PaymentResponseSchema)
) {}
