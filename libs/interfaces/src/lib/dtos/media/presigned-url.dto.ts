import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreatePresignedUrlRequestSchema,
  CreatePresignedUrlResponseSchema,
} from '@common/interfaces/models/media';
import { createZodDto } from 'nestjs-zod';

export class CreatePresignedUrlRequestDto extends createZodDto(
  CreatePresignedUrlRequestSchema
) {}

export class CreatePresignedUrlResponseDto extends createZodDto(
  ResponseSchema(CreatePresignedUrlResponseSchema)
) {}
