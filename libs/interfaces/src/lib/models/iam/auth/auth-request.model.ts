import z from 'zod';

export const ExchangeTokenRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    code: z.string(),
  })
  .strict();

export const RefreshSessionRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    refreshToken: z.string(),
  })
  .strict();

export const LogoutCurrentSessionRequestSchema = RefreshSessionRequestSchema;

export const ChangePasswordRequestSchema = z
  .object({
    previousPassword: z.string(),
    proposedPassword: z.string(),
    accessToken: z.string(),
  })
  .strict();

export const ValidateTokenRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    accessToken: z.string(),
  })
  .strict();

export type ExchangeTokenRequest = z.infer<typeof ExchangeTokenRequestSchema>;
export type RefreshSessionRequest = z.infer<typeof RefreshSessionRequestSchema>;
export type LogoutCurrentSessionRequest = z.infer<
  typeof LogoutCurrentSessionRequestSchema
>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type ValidateTokenRequest = z.infer<typeof ValidateTokenRequestSchema>;
