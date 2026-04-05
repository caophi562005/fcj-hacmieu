import { UserSchema } from '@common/schemas/user-access/user.schema';
import z from 'zod';
import { PaginationQueryResponseSchema } from '../common/pagination.model';

export const UserResponseSchema = UserSchema.safeExtend({
  shop: z
    .object({
      id: z.string(),
    })
    .optional(),
});

export const CheckParticipantExistsResponseSchema = z.object({
  count: z.number(),
});

export const GetManyUsersResponseSchema = PaginationQueryResponseSchema.extend({
  users: z.array(
    UserSchema.pick({
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      gender: true,
      status: true,
      roleName: true,
    })
  ),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
export type CheckParticipantExistsResponse = z.infer<
  typeof CheckParticipantExistsResponseSchema
>;
export type GetManyUsersResponse = z.infer<typeof GetManyUsersResponseSchema>;

export const GetManyInformationUsersResponseSchema = z.object({
  users: z.record(
    z.string(),
    z.object({
      username: z.string(),
      avatar: z.string().optional(),
    })
  ),
});

export type GetManyInformationUsersResponse = z.infer<
  typeof GetManyInformationUsersResponseSchema
>;
