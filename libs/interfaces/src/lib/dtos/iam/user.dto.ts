import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  GetManyUsersRequestSchema,
  GetManyUsersResponseSchema,
  GetUserRequestSchema,
  UpdateUserRequestSchema,
  UserResponseSchema,
} from '@common/interfaces/models/iam';
import { createZodDto } from 'nestjs-zod';

export class GetUserRequestDto extends createZodDto(
  GetUserRequestSchema.omit({
    processId: true,
  }),
) {}

export class GetManyUsersRequestDto extends createZodDto(
  GetManyUsersRequestSchema.omit({
    processId: true,
  }),
) {}

export class UpdateUserRequestDto extends createZodDto(
  UpdateUserRequestSchema.omit({
    processId: true,
    id: true,
  }),
) {}

export class UserResponseDto extends createZodDto(
  ResponseSchema(UserResponseSchema),
) {}

export class GetManyUsersResponseDto extends createZodDto(
  ResponseSchema(GetManyUsersResponseSchema),
) {}
