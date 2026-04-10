import {
  CreateAttributeRequestSchema,
  DeleteAttributeRequestSchema,
  GetAttributeRequestSchema,
  GetAttributeResponseSchema,
  GetManyAttributesRequestSchema,
  GetManyAttributesResponseSchema,
  UpdateAttributeRequestSchema,
} from '@common/interfaces/models/catalog';
import { createZodDto } from 'nestjs-zod';

export class GetManyAttributesRequestDto extends createZodDto(
  GetManyAttributesRequestSchema,
) {}

export class GetAttributeRequestDto extends createZodDto(
  GetAttributeRequestSchema,
) {}

export class CreateAttributeRequestDto extends createZodDto(
  CreateAttributeRequestSchema.omit({ processId: true, createdById: true }),
) {}

export class UpdateAttributeRequestDto extends createZodDto(
  UpdateAttributeRequestSchema.omit({ processId: true, updatedById: true }),
) {}

export class DeleteAttributeRequestDto extends createZodDto(
  DeleteAttributeRequestSchema.omit({ processId: true, deletedById: true }),
) {}

// ====================================================================================================

export class GetManyAttributesResponseDto extends createZodDto(
  GetManyAttributesResponseSchema,
) {}

export class GetAttributeResponseDto extends createZodDto(
  GetAttributeResponseSchema,
) {}
