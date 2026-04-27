import z from 'zod';

export const RefreshSessionRequestSchema = z
  .object({
    processId: z.uuid().optional(),
    refreshToken: z.string(),
  })
  .strict();

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

export type RefreshSessionRequest = z.infer<typeof RefreshSessionRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type ValidateTokenRequest = z.infer<typeof ValidateTokenRequestSchema>;
