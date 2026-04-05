import {
  GetManyMessagesRequestSchema,
  GetManyMessagesResponseSchema,
} from '@common/interfaces/models/chat';
import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import { createZodDto } from 'nestjs-zod';

export class GetManyMessagesRequestDto extends createZodDto(
  GetManyMessagesRequestSchema
) {}

//=================================================Response DTOs=================================================

export class GetManyMessagesResponseDto extends createZodDto(
  ResponseSchema(GetManyMessagesResponseSchema)
) {}
