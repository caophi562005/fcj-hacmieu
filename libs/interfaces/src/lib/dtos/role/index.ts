import {
  CreateRoleRequestSchema,
  DeleteRoleRequestSchema,
  GetManyRolesRequestSchema,
  GetManyRolesResponseSchema,
  GetRoleRequestSchema,
  GetRoleResponseSchema,
  UpdateRoleRequestSchema,
} from '@common/interfaces/models/role/role';
import { createZodDto } from 'nestjs-zod';

export class GetManyRolesRequestDto extends createZodDto(
  GetManyRolesRequestSchema
) {}

export class GetManyRolesResponseDto extends createZodDto(
  GetManyRolesResponseSchema
) {}

export class GetRoleResponseDto extends createZodDto(GetRoleResponseSchema) {}

export class GetRoleRequestDto extends createZodDto(GetRoleRequestSchema) {}

export class CreateRoleRequestDto extends createZodDto(
  CreateRoleRequestSchema
) {}

export class UpdateRoleRequestDto extends createZodDto(
  UpdateRoleRequestSchema
) {}

export class DeleteRoleRequestDto extends createZodDto(
  DeleteRoleRequestSchema
) {}
