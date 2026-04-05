import {
  ChangePasswordRequestSchema,
  LoginPostmanResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  RegisterRequestSchema,
  SendVerificationCodeRequestSchema,
} from '@common/interfaces/models/auth';
import { createZodDto } from 'nestjs-zod';

export class LoginRequestDto extends createZodDto(LoginRequestSchema) {}

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

export class RefreshTokenRequestDto extends createZodDto(
  RefreshTokenRequestSchema
) {}

export class RefreshTokenResponseDto extends createZodDto(
  RefreshTokenResponseSchema
) {}

export class SendVerificationCodeRequestDto extends createZodDto(
  SendVerificationCodeRequestSchema.omit({ processId: true })
) {}

export class LogoutRequestDto extends createZodDto(LogoutRequestSchema) {}

export class RegisterRequestDto extends createZodDto(
  RegisterRequestSchema.omit({ processId: true })
) {}

export class ChangePasswordRequestDto extends createZodDto(
  ChangePasswordRequestSchema.omit({ processId: true })
) {}

export class LoginPostmanResponseDto extends createZodDto(
  LoginPostmanResponseSchema
) {}
