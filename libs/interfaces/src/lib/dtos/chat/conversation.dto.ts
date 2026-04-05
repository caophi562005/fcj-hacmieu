import {
  ConversationResponseSchema,
  CreateConversationRequestSchema,
  GetManyConversationsRequestSchema,
  GetManyConversationsResponseSchema,
} from '@common/interfaces/models/chat';
import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import { createZodDto } from 'nestjs-zod';

export class CreateConversationRequestDto extends createZodDto(
  CreateConversationRequestSchema
) {}

export class GetManyConversationsRequestDto extends createZodDto(
  GetManyConversationsRequestSchema
) {}

//=================================================Response DTOs=================================================
export class GetManyConversationsResponseDto extends createZodDto(
  ResponseSchema(GetManyConversationsResponseSchema)
) {}

export class ConversationResponseDto extends createZodDto(
  ResponseSchema(ConversationResponseSchema)
) {}
