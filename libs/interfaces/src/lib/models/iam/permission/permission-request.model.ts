import { PaginationQueryRequestSchema } from '@common/interfaces/models/common/pagination.model';
import { PermissionSchema } from '@common/schemas/iam/permission.schema';
import z from 'zod';

export const GetManyPermissionsRequestSchema =
  PaginationQueryRequestSchema.extend({
    processId: z.string().optional(),
    group: PermissionSchema.shape.group.optional(),
  }).strict();

export const GetAllPermissionsRequestSchema = z
  .object({
    group: PermissionSchema.shape.group,
    processId: z.string().optional(),
  })
  .strict();

export const GetPermissionRequestSchema = PermissionSchema.pick({
  id: true,
}).strict();

export const CreatePermissionRequestSchema = PermissionSchema.pick({
  name: true,
  description: true,
  module: true,
  path: true,
  method: true,
  group: true,
  createdById: true,
}).strict();

export const CreateManyPermissionsRequestSchema = z.object({
  permissions: z.array(CreatePermissionRequestSchema),
});

export const UpdatePermissionRequestSchema = PermissionSchema.pick({
  id: true,
  name: true,
  description: true,
  module: true,
  path: true,
  method: true,
  group: true,
  updatedById: true,
})
  .extend({
    permissionIds: z.array(z.uuid()),
  })
  .partial()
  .strict();

export const DeletePermissionRequestSchema = PermissionSchema.pick({
  id: true,
  deletedById: true,
}).strict();

export const DeleteManyPermissionsRequestSchema = z.object({
  ids: z.array(z.uuid()),
});

export type GetManyPermissionsRequest = z.infer<
  typeof GetManyPermissionsRequestSchema
>;
export type GetAllPermissionsRequest = z.infer<
  typeof GetAllPermissionsRequestSchema
>;
export type GetPermissionRequest = z.infer<typeof GetPermissionRequestSchema>;
export type CreatePermissionRequest = z.infer<
  typeof CreatePermissionRequestSchema
>;
export type CreateManyPermissionsRequest = z.infer<
  typeof CreateManyPermissionsRequestSchema
>;
export type UpdatePermissionRequest = z.infer<
  typeof UpdatePermissionRequestSchema
>;
export type DeletePermissionRequest = z.infer<
  typeof DeletePermissionRequestSchema
>;
export type DeleteManyPermissionsRequest = z.infer<
  typeof DeleteManyPermissionsRequestSchema
>;
