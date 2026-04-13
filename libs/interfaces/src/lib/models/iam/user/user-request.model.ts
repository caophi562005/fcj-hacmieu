import { UserSchema } from '@common/schemas/iam/user.schema';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../../common/pagination.model';

export const GetUserRequestSchema = UserSchema.pick({
  id: true,
  email: true,
  username: true,
})
  .partial()
  .extend({
    processId: z.string().optional(),
  });

export const GetManyUsersRequestSchema = UserSchema.pick({
  email: true,
  username: true,
  gender: true,
  status: true,
  group: true,
})
  .partial()
  .safeExtend({
    processId: z.string().optional(),
    page: PaginationQueryRequestSchema.shape.page,
    limit: PaginationQueryRequestSchema.shape.limit,
  });

export const CreateUserRequestSchema = UserSchema.pick({
  id: true,
  email: true,
  username: true,
  avatar: true,
  group: true,
});

export const UpdateUserRequestSchema = UserSchema.pick({
  phoneNumber: true,
  avatar: true,
  gender: true,
  birthday: true,
})
  .partial()
  .extend({
    id: z.uuid(),
    processId: z.string().optional(),
  })
  .strict();

export type GetUserRequest = z.infer<typeof GetUserRequestSchema>;
export type GetManyUsersRequest = z.infer<typeof GetManyUsersRequestSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
