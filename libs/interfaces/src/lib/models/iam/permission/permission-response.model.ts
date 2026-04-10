import { PaginationQueryResponseSchema } from '@common/interfaces/models/common/pagination.model';
import { PermissionSchema } from '@common/schemas/iam/permission.schema';
import z from 'zod';

export const GetManyPermissionsResponseSchema =
  PaginationQueryResponseSchema.extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        path: true,
        method: true,
        module: true,
        group: true,
      }),
    ),
  });

export const GetAllPermissionsResponseSchema = z.object({
  permissions: z.array(
    PermissionSchema.pick({
      id: true,
      path: true,
      method: true,
      module: true,
      group: true,
    }),
  ),
});

export const GetPermissionResponseSchema = PermissionSchema;

export const CountResponseSchema = z.object({
  count: z.number(),
});

export type GetManyPermissionsResponse = z.infer<
  typeof GetManyPermissionsResponseSchema
>;
export type GetAllPermissionsResponse = z.infer<
  typeof GetAllPermissionsResponseSchema
>;
export type GetPermissionResponse = z.infer<typeof GetPermissionResponseSchema>;

export type CountResponse = z.infer<typeof CountResponseSchema>;
