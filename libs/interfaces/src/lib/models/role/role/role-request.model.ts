import { PaginationQueryRequestSchema } from '@common/interfaces/models/common/pagination.model';
import { RoleSchema } from '@common/schemas/role';
import z from 'zod';

export const GetManyRolesRequestSchema = PaginationQueryRequestSchema;

export const GetRoleRequestSchema = RoleSchema.pick({
  id: true,
  name: true,
})
  .partial()
  .extend({
    withInheritance: z.boolean(),
  })
  .strict();

export const CreateRoleRequestSchema = RoleSchema.pick({
  name: true,
  description: true,
  createdById: true,
}).strict();

export const UpdateRoleRequestSchema = RoleSchema.pick({
  name: true,
  description: true,
  updatedById: true,
})
  .partial()
  .extend({ id: z.uuid(), permissionIds: z.array(z.uuid()) })
  .strict();

export const DeleteRoleRequestSchema = RoleSchema.pick({
  id: true,
  deletedById: true,
}).strict();

export type GetManyRolesRequest = z.infer<typeof GetManyRolesRequestSchema>;
export type GetRoleRequest = z.infer<typeof GetRoleRequestSchema>;
export type CreateRoleRequest = z.infer<typeof CreateRoleRequestSchema>;
export type UpdateRoleRequest = z.infer<typeof UpdateRoleRequestSchema>;
export type DeleteRoleRequest = z.infer<typeof DeleteRoleRequestSchema>;
