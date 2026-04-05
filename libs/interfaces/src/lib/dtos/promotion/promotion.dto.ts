import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreatePromotionRequestSchema,
  DeletePromotionRequestSchema,
  GetManyPromotionsRequestSchema,
  GetManyPromotionsResponseSchema,
  GetPromotionRequestSchema,
  GetPromotionResponseSchema,
  PromotionResponseSchema,
  UpdatePromotionRequestSchema,
} from '@common/interfaces/models/promotion';
import { createZodDto } from 'nestjs-zod';

export class GetManyPromotionsRequestDto extends createZodDto(
  GetManyPromotionsRequestSchema.omit({ processId: true })
) {}

export class GetPromotionRequestDto extends createZodDto(
  GetPromotionRequestSchema.omit({ processId: true })
) {}

export class CreatePromotionRequestDto extends createZodDto(
  CreatePromotionRequestSchema.omit({ processId: true, createdById: true })
) {}

export class UpdatePromotionRequestDto extends createZodDto(
  UpdatePromotionRequestSchema.omit({ processId: true })
) {}

export class DeletePromotionRequestDto extends createZodDto(
  DeletePromotionRequestSchema.omit({ processId: true })
) {}

//=================================================Response DTOs=================================================

export class GetManyPromotionsResponseDto extends createZodDto(
  ResponseSchema(GetManyPromotionsResponseSchema)
) {}

export class GetPromotionResponseDto extends createZodDto(
  ResponseSchema(GetPromotionResponseSchema)
) {}

export class PromotionResponseDto extends createZodDto(
  ResponseSchema(PromotionResponseSchema)
) {}
