import {
  CreateBrandRequestSchema,
  DeleteBrandRequestSchema,
  GetBrandRequestSchema,
  GetBrandResponseSchema,
  GetManyBrandsRequestSchema,
  GetManyBrandsResponseSchema,
  UpdateBrandRequestSchema,
} from '@common/interfaces/models/catalog';
import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import { createZodDto } from 'nestjs-zod';

export class GetManyBrandsRequestDto extends createZodDto(
  GetManyBrandsRequestSchema,
) {}

export class GetBrandRequestDto extends createZodDto(GetBrandRequestSchema) {}

export class CreateBrandRequestDto extends createZodDto(
  CreateBrandRequestSchema.omit({ processId: true, createdById: true }),
) {}

export class UpdateBrandRequestDto extends createZodDto(
  UpdateBrandRequestSchema.omit({ processId: true, updatedById: true }),
) {}

export class DeleteBrandRequestDto extends createZodDto(
  DeleteBrandRequestSchema.omit({ processId: true, deletedById: true }),
) {}

// ====================================================================================================

export class GetManyBrandsResponseDto extends createZodDto(
  ResponseSchema(GetManyBrandsResponseSchema),
) {}

export class GetBrandResponseDto extends createZodDto(
  ResponseSchema(GetBrandResponseSchema),
) {}
