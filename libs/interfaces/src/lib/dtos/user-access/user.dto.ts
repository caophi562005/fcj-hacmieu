import { ResponseSchema } from '@common/interfaces/models/common/response.model';
import {
  GetManyUsersRequestSchema,
  GetManyUsersResponseSchema,
  GetUserRequestSchema,
  UpdateUserRequestSchema,
  UserResponseSchema,
} from '@common/interfaces/models/user-access';
import { createZodDto } from 'nestjs-zod';

export class GetUserRequestDto extends createZodDto(GetUserRequestSchema) {}

export class GetManyUsersRequestDto extends createZodDto(
  GetManyUsersRequestSchema
) {}

export class UpdateUserRequestDto extends createZodDto(
  UpdateUserRequestSchema
) {}

export class UserResponseDto extends createZodDto(
  ResponseSchema(UserResponseSchema)
) {}

export class GetManyUsersResponseDto extends createZodDto(
  ResponseSchema(GetManyUsersResponseSchema)
) {}
