import z from 'zod';

export const RefreshSessionResponseSchema = z.object({
  accessToken: z.string(),
  idToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number(),
  tokenType: z.string(),
  scope: z.string().optional(),
});

export type RefreshSessionResponse = z.infer<
  typeof RefreshSessionResponseSchema
>;
