import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateCategoryRequestSchema,
  DeleteCategoryRequestSchema,
  GetCategoryRequestSchema,
  GetCategoryResponseSchema,
  GetManyCategoriesRequestSchema,
  GetManyCategoriesResponseSchema,
  UpdateCategoryRequestSchema,
} from '@common/interfaces/models/product';
import { createZodDto } from 'nestjs-zod';

export class GetManyCategoriesRequestDto extends createZodDto(
  GetManyCategoriesRequestSchema
) {}

export class GetCategoryRequestDto extends createZodDto(
  GetCategoryRequestSchema
) {}

export class CreateCategoryRequestDto extends createZodDto(
  CreateCategoryRequestSchema
) {}

export class UpdateCategoryRequestDto extends createZodDto(
  UpdateCategoryRequestSchema
) {}

export class DeleteCategoryRequestDto extends createZodDto(
  DeleteCategoryRequestSchema
) {}

//=================================================Response DTOs=================================================

export class GetManyCategoriesResponseDto extends createZodDto(
  ResponseSchema(GetManyCategoriesResponseSchema)
) {}

export class GetCategoryResponseDto extends createZodDto(
  ResponseSchema(GetCategoryResponseSchema)
) {}
