import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateBrandRequestSchema,
  DeleteBrandRequestSchema,
  GetBrandRequestSchema,
  GetBrandResponseSchema,
  GetManyBrandsRequestSchema,
  GetManyBrandsResponseSchema,
  UpdateBrandRequestSchema,
} from '@common/interfaces/models/product';
import { createZodDto } from 'nestjs-zod';

export class GetManyBrandsRequestDto extends createZodDto(
  GetManyBrandsRequestSchema
) {}

export class GetBrandRequestDto extends createZodDto(GetBrandRequestSchema) {}

export class CreateBrandRequestDto extends createZodDto(
  CreateBrandRequestSchema
) {}

export class UpdateBrandRequestDto extends createZodDto(
  UpdateBrandRequestSchema
) {}

export class DeleteBrandRequestDto extends createZodDto(
  DeleteBrandRequestSchema
) {}

//=================================================Response DTOs=================================================

export class GetManyBrandsResponseDto extends createZodDto(
  ResponseSchema(GetManyBrandsResponseSchema)
) {}

export class GetBrandResponseDto extends createZodDto(
  ResponseSchema(GetBrandResponseSchema)
) {}
