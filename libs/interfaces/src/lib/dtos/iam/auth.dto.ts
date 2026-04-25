import {
  MessageResponseSchema,
  ResponseSchema,
} from '@common/interfaces/models/common/response.model';
import {
  ChangePasswordRequestSchema,
  ExchangeTokenRequestSchema,
  ExchangeTokenResponseSchema,
} from '@common/interfaces/models/iam';
import { createZodDto } from 'nestjs-zod';

export class ExchangeTokenRequestDto extends createZodDto(
  ExchangeTokenRequestSchema.omit({ processId: true }),
) {}

export class ChangePasswordRequestDto extends createZodDto(
  ChangePasswordRequestSchema.omit({ accessToken: true }),
) {}

export class ExchangeTokenResponseDto extends createZodDto(
  ResponseSchema(ExchangeTokenResponseSchema),
) {}

export class MessageResponseDto extends createZodDto(
  ResponseSchema(MessageResponseSchema),
) {}
