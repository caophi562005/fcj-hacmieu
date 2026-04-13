import {
  CreateCategoryRequestSchema,
  DeleteCategoryRequestSchema,
  GetCategoryRequestSchema,
  GetCategoryResponseSchema,
  GetManyCategoriesRequestSchema,
  GetManyCategoriesResponseSchema,
  UpdateCategoryRequestSchema,
} from '@common/interfaces/models/catalog';
import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import { createZodDto } from 'nestjs-zod';

export class GetManyCategoriesRequestDto extends createZodDto(
  GetManyCategoriesRequestSchema.omit({ processId: true }),
) {}

export class GetCategoryRequestDto extends createZodDto(
  GetCategoryRequestSchema.omit({ processId: true }),
) {}

export class CreateCategoryRequestDto extends createZodDto(
  CreateCategoryRequestSchema.omit({ processId: true, createdById: true }),
) {}

export class UpdateCategoryRequestDto extends createZodDto(
  UpdateCategoryRequestSchema.omit({ processId: true, updatedById: true }),
) {}

export class DeleteCategoryRequestDto extends createZodDto(
  DeleteCategoryRequestSchema.omit({ processId: true, deletedById: true }),
) {}

// ====================================================================================================

export class GetManyCategoriesResponseDto extends createZodDto(
  ResponseSchema(GetManyCategoriesResponseSchema),
) {}

export class GetCategoryResponseDto extends createZodDto(
  ResponseSchema(GetCategoryResponseSchema),
) {}
