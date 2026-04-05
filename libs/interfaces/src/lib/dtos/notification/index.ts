import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateNotificationRequestSchema,
  DeleteNotificationRequestSchema,
  GetManyNotificationsRequestSchema,
  GetManyNotificationsResponseSchema,
  GetNotificationResponseSchema,
  ReadNotificationRequestSchema,
} from '@common/interfaces/models/notification';
import { createZodDto } from 'nestjs-zod';

export class GetManyNotificationsRequestDto extends createZodDto(
  GetManyNotificationsRequestSchema
) {}

export class CreateNotificationRequestDto extends createZodDto(
  CreateNotificationRequestSchema
) {}

export class ReadNotificationRequestDto extends createZodDto(
  ReadNotificationRequestSchema
) {}

export class DeleteNotificationRequestDto extends createZodDto(
  DeleteNotificationRequestSchema
) {}

//=================================================Response DTOs=================================================

export class GetManyNotificationsResponseDto extends createZodDto(
  ResponseSchema(GetManyNotificationsResponseSchema)
) {}

export class GetNotificationResponseDto extends createZodDto(
  ResponseSchema(GetNotificationResponseSchema)
) {}
