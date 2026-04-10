import z from 'zod';

export const ExchangeTokenResponseSchema = z.object({
  accessToken: z.string(),
  idToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number(),
  tokenType: z.string(),
  scope: z.string().optional(),
});

export type ExchangeTokenResponse = z.infer<typeof ExchangeTokenResponseSchema>;
