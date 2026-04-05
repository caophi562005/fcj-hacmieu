import {
  UserSchema,
  VerificationCodeSchema,
} from '@common/schemas/user-access';
import z from 'zod';

export const LoginRequestSchema = UserSchema.pick({
  username: true,
})
  .extend({
    password: z.string(),
  })
  .strict();

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const LogoutRequestSchema = RefreshTokenRequestSchema;

export const RegisterRequestSchema = UserSchema.pick({
  username: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  gender: true,
})
  .extend({
    processId: z.uuid().optional(),
    code: z.string(),
    password: z.string(),
  })
  .strict();

export const VerifyTokenRequestSchema = z.object({
  token: z.string(),
  processId: z.uuid().optional(),
  withPermissions: z.boolean().optional(),
});

export const SendVerificationCodeRequestSchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
})
  .extend({
    processId: z.uuid().optional(),
  })
  .strict();

export const ValidateVerificationCodeRequestSchema =
  VerificationCodeSchema.pick({
    email: true,
    type: true,
    code: true,
  });

export const DeleteVerificationCodeRequestSchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
});

export const ChangePasswordRequestSchema = UserSchema.pick({
  email: true,
})
  .extend({
    password: z.string(),
    code: z.string(),
    processId: z.uuid().optional(),
  })
  .strict();

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type VerifyTokenRequest = z.infer<typeof VerifyTokenRequestSchema>;
export type SendVerificationCodeRequest = z.infer<
  typeof SendVerificationCodeRequestSchema
>;
export type ValidateVerificationCodeRequest = z.infer<
  typeof ValidateVerificationCodeRequestSchema
>;
export type DeleteVerificationCodeRequest = z.infer<
  typeof DeleteVerificationCodeRequestSchema
>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
