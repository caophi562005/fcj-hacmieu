import { PaginationQueryResponseSchema } from '@common/interfaces/models/common/pagination.model';
import { PermissionSchema } from '@common/schemas/role';
import z from 'zod';

export const GetManyPermissionsResponseSchema =
  PaginationQueryResponseSchema.extend({
    permissions: z.array(PermissionSchema),
  });

export const GetManyUniquePermissionsResponseSchema = z.object({
  permissions: z.array(
    PermissionSchema.pick({
      id: true,
      method: true,
      path: true,
    })
  ),
});

export const GetPermissionResponseSchema = PermissionSchema;

export const CountResponseSchema = z.object({
  count: z.number(),
});

export type GetManyPermissionsResponse = z.infer<
  typeof GetManyPermissionsResponseSchema
>;
export type GetManyUniquePermissionsResponse = z.infer<
  typeof GetManyUniquePermissionsResponseSchema
>;
export type GetPermissionResponse = z.infer<typeof GetPermissionResponseSchema>;

export type CountResponse = z.infer<typeof CountResponseSchema>;
