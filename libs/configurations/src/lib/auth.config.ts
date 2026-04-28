import z from 'zod';

export const AuthConfigurationSchema = z.object({
  COGNITO_DOMAIN: z.string(),
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),
  REDIRECT_URI: z.string(),
  LOGOUT_URI: z.string(),
  USER_POOL_ID: z.string(),
  PAYMENT_API_KEY: z.string(),
});

const configServer = AuthConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const AuthConfiguration = configServer.data;
