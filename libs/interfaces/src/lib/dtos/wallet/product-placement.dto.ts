import { createZodDto } from 'nestjs-zod';
import { ResponseSchema } from '../../models/common/response.model';
import {
  CancelProductPlacementRequestSchema,
  CreateProductPlacementRequestSchema,
  GetProductPlacementsRequestSchema,
  GetProductPlacementsResponseSchema,
  ProductPlacementConfigResponseSchema,
  ProductPlacementResponseSchema,
} from '../../models/wallet';

export class CreateProductPlacementRequestDto extends createZodDto(
  CreateProductPlacementRequestSchema.omit({ processId: true, shopId: true }),
) {}

export class GetProductPlacementsRequestDto extends createZodDto(
  GetProductPlacementsRequestSchema.omit({ processId: true }),
) {}

export class CancelProductPlacementRequestDto extends createZodDto(
  CancelProductPlacementRequestSchema.omit({
    processId: true,
    placementId: true,
    actorId: true,
  }),
) {}

export class ProductPlacementIdParamDto extends createZodDto(
  CancelProductPlacementRequestSchema.pick({ placementId: true }),
) {}

export class ProductPlacementResponseDto extends createZodDto(
  ResponseSchema(ProductPlacementResponseSchema),
) {}

export class ProductPlacementConfigResponseDto extends createZodDto(
  ResponseSchema(ProductPlacementConfigResponseSchema),
) {}

export class GetProductPlacementsResponseDto extends createZodDto(
  ResponseSchema(GetProductPlacementsResponseSchema),
) {}
