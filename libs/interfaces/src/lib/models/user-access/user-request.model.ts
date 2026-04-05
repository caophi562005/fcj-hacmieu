import { DefaultRoleNameEnums } from '@common/constants/user.constant';
import { UserSchema } from '@common/schemas/user-access/user.schema';
import z from 'zod';
import { PaginationQueryRequestSchema } from '../common/pagination.model';

export const GetUserRequestSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    phoneNumber: z.string(),
  })
  .partial()
  .extend({
    processId: z.string().optional(),
  });

export const GetManyUsersRequestSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  phoneNumber: true,
  gender: true,
  status: true,
})
  .partial()
  .safeExtend({
    roleName: DefaultRoleNameEnums.optional(),
    processId: z.string().optional(),
    page: PaginationQueryRequestSchema.shape.page,
    limit: PaginationQueryRequestSchema.shape.limit,
  });

export const CreateUserRequestSchema = UserSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  phoneNumber: true,
  avatar: true,
  gender: true,
  roleId: true,
  roleName: true,
});

export const UpdateUserRequestSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
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

export const CheckParticipantExistsRequestSchema = z.object({
  processId: z.uuid().optional(),
  participantIds: z.array(z.uuid()),
});

export const UpdateRoleRequestSchema = UserSchema.pick({
  roleId: true,
  roleName: true,
  id: true,
})
  .extend({
    processId: z.string().optional(),
  })
  .strict();

export const GetManyInformationUsersRequestSchema = z.object({
  userIds: z.array(z.uuid()),
  processId: z.string().optional(),
});

export type GetUserRequest = z.infer<typeof GetUserRequestSchema>;
export type GetManyUsersRequest = z.infer<typeof GetManyUsersRequestSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type CheckParticipantExistsRequest = z.infer<
  typeof CheckParticipantExistsRequestSchema
>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UpdateRoleRequest = z.infer<typeof UpdateRoleRequestSchema>;
export type GetManyInformationUsersRequest = z.infer<
  typeof GetManyInformationUsersRequestSchema
>;
