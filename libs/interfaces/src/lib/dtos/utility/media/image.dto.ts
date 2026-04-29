import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreatePresignedUrlRequestSchema,
  CreatePresignedUrlResponseSchema,
} from '@common/interfaces/models/utility';
import { createZodDto } from 'nestjs-zod';

export class CreatePresignedUrlRequestDto extends createZodDto(
  CreatePresignedUrlRequestSchema.omit({ processId: true }),
) {}

export class CreatePresignedUrlResponseDto extends createZodDto(
  ResponseSchema(CreatePresignedUrlResponseSchema),
) {}
