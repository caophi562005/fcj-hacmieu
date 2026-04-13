import {
  CreateProductRequestSchema,
  DeleteProductRequestSchema,
  GetManyProductsRequestSchema,
  GetManyProductsResponseSchema,
  GetProductRequestSchema,
  GetProductResponseSchema,
  UpdateProductRequestSchema,
} from '@common/interfaces/models/catalog';
import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import { createZodDto } from 'nestjs-zod';

export class GetManyProductsRequestDto extends createZodDto(
  GetManyProductsRequestSchema.omit({ processId: true }),
) {}

export class GetProductRequestDto extends createZodDto(
  GetProductRequestSchema.omit({ processId: true }),
) {}

export class CreateProductRequestDto extends createZodDto(
  CreateProductRequestSchema,
) {}

export class UpdateProductRequestDto extends createZodDto(
  UpdateProductRequestSchema,
) {}

export class DeleteProductRequestDto extends createZodDto(
  DeleteProductRequestSchema.omit({ processId: true, deletedById: true }),
) {}

// ====================================================================================================

export class GetManyProductsResponseDto extends createZodDto(
  ResponseSchema(GetManyProductsResponseSchema),
) {}

export class GetProductResponseDto extends createZodDto(
  ResponseSchema(GetProductResponseSchema),
) {}
