import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  CreateNotificationRequestSchema,
  DeleteNotificationRequestSchema,
  GetManyNotificationsRequestSchema,
  GetManyNotificationsResponseSchema,
  GetNotificationRequestSchema,
  GetNotificationResponseSchema,
  ReadNotificationRequestSchema,
  ReadNotificationResponseSchema,
} from '@common/interfaces/models/utility';
import { createZodDto } from 'nestjs-zod';

export class GetManyNotificationsRequestDto extends createZodDto(
  GetManyNotificationsRequestSchema,
) {}

export class GetNotificationRequestDto extends createZodDto(
  GetNotificationRequestSchema,
) {}

export class CreateNotificationRequestDto extends createZodDto(
  CreateNotificationRequestSchema,
) {}

export class ReadNotificationRequestDto extends createZodDto(
  ReadNotificationRequestSchema,
) {}

export class DeleteNotificationRequestDto extends createZodDto(
  DeleteNotificationRequestSchema,
) {}

export class GetManyNotificationsResponseDto extends createZodDto(
  ResponseSchema(GetManyNotificationsResponseSchema),
) {}

export class GetNotificationResponseDto extends createZodDto(
  ResponseSchema(GetNotificationResponseSchema),
) {}

export class ReadNotificationResponseDto extends createZodDto(
  ResponseSchema(ReadNotificationResponseSchema),
) {}
