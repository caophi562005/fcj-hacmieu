import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateProductRequestSchema,
  DeleteProductRequestSchema,
  GetManyProductsRequestSchema,
  GetManyProductsResponseSchema,
  GetProductRequestSchema,
  GetProductResponseSchema,
  UpdateProductRequestSchema,
} from '@common/interfaces/models/product';
import { createZodDto } from 'nestjs-zod';

export class GetManyProductsRequestDto extends createZodDto(
  GetManyProductsRequestSchema
) {}

export class GetProductRequestDto extends createZodDto(
  GetProductRequestSchema
) {}

export class CreateProductRequestDto extends createZodDto(
  CreateProductRequestSchema
) {}

export class UpdateProductRequestDto extends createZodDto(
  UpdateProductRequestSchema
) {}

export class DeleteProductRequestDto extends createZodDto(
  DeleteProductRequestSchema
) {}

//=================================================Response DTOs=================================================

export class GetManyProductsResponseDto extends createZodDto(
  ResponseSchema(GetManyProductsResponseSchema)
) {}

export class GetProductResponseDto extends createZodDto(
  ResponseSchema(GetProductResponseSchema)
) {}
