import {
  MessageResponseSchema,
  ResponseSchema,
} from '@common/interfaces/models/common/response.model';
import {
  ChangePasswordRequestSchema,
  RefreshSessionResponseSchema,
} from '@common/interfaces/models/iam';
import { createZodDto } from 'nestjs-zod';

export class ChangePasswordRequestDto extends createZodDto(
  ChangePasswordRequestSchema.omit({ accessToken: true }),
) {}

export class RefreshSessionResponseDto extends createZodDto(
  ResponseSchema(RefreshSessionResponseSchema),
) {}

export class MessageResponseDto extends createZodDto(
  ResponseSchema(MessageResponseSchema),
) {}
