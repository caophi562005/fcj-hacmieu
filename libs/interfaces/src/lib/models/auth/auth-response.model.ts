import z from 'zod';
import { ResponseSchema } from '../common/response.model';

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  refreshExpiresIn: z.number(),
});

export const RefreshTokenResponseSchema = LoginResponseSchema;

export const RegisterResponseSchema = z.object({
  userId: z.uuid(),
});

export const VerifyTokenResponseSchema = z.object({
  isValid: z.boolean(),
  userId: z.string(),
  roleId: z.string(),
  roleName: z.string(),
  shopId: z.uuid().optional(),
  permissions: z.array(
    z.object({
      id: z.string(),
      path: z.string(),
      method: z.string(),
    })
  ),
});

export const LoginPostmanResponseSchema = ResponseSchema(z.object({}));

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type VerifyTokenResponse = z.infer<typeof VerifyTokenResponseSchema>;
