import { UserSchema } from '@common/schemas/iam/user.schema';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../../common/pagination.model';

export const UserResponseSchema = UserSchema;

export const GetManyUsersResponseSchema = PaginationQueryResponseSchema.extend({
  users: z.array(
    UserSchema.pick({
      id: true,
      email: true,
      phoneNumber: true,
      gender: true,
      status: true,
      group: true,
    }),
  ),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
export type GetManyUsersResponse = z.infer<typeof GetManyUsersResponseSchema>;
