import {
  CreateAttributeRequestSchema,
  DeleteAttributeRequestSchema,
  GetAttributeRequestSchema,
  GetAttributeResponseSchema,
  GetManyAttributesRequestSchema,
  GetManyAttributesResponseSchema,
  UpdateAttributeRequestSchema,
} from '@common/interfaces/models/product';
import { createZodDto } from 'nestjs-zod';

export class GetManyAttributesRequestDto extends createZodDto(
  GetManyAttributesRequestSchema
) {}

export class GetAttributeRequestDto extends createZodDto(
  GetAttributeRequestSchema
) {}

export class CreateAttributeRequestDto extends createZodDto(
  CreateAttributeRequestSchema
) {}

export class UpdateAttributeRequestDto extends createZodDto(
  UpdateAttributeRequestSchema
) {}

export class DeleteAttributeRequestDto extends createZodDto(
  DeleteAttributeRequestSchema
) {}

//=================================================Response DTOs=================================================

export class GetManyAttributesResponseDto extends createZodDto(
  GetManyAttributesResponseSchema
) {}

export class GetAttributeResponseDto extends createZodDto(
  GetAttributeResponseSchema
) {}
