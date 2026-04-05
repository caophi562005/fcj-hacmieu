import { PaginationQueryResponseSchema } from '@common/interfaces/models/common/pagination.model';
import { PermissionSchema, RoleSchema } from '@common/schemas/role';
import z from 'zod';

export const GetManyRolesResponseSchema = PaginationQueryResponseSchema.extend({
  roles: z.array(
    RoleSchema.pick({
      id: true,
      name: true,
      description: true,
      createdAt: true,
    })
  ),
});

export const GetRoleResponseSchema = RoleSchema.extend({
  permissions: z.array(
    PermissionSchema.pick({
      id: true,
      path: true,
      method: true,
    })
  ),
});

export type GetManyRolesResponse = z.infer<typeof GetManyRolesResponseSchema>;
export type GetRoleResponse = z.infer<typeof GetRoleResponseSchema>;
