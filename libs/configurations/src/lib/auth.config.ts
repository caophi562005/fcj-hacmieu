import z from 'zod';

export const AuthConfigurationSchema = z.object({
  COGNITO_DOMAIN: z.string(),

  CUSTOMER_CLIENT_ID: z.string(),
  CUSTOMER_CLIENT_SECRET: z.string(),
  CUSTOMER_REDIRECT_URI: z.string(),
  CUSTOMER_LOGOUT_URI: z.string(),

  SELLER_CLIENT_ID: z.string(),
  SELLER_CLIENT_SECRET: z.string(),
  SELLER_REDIRECT_URI: z.string(),
  SELLER_LOGOUT_URI: z.string(),

  ADMIN_CLIENT_ID: z.string(),
  ADMIN_CLIENT_SECRET: z.string(),
  ADMIN_REDIRECT_URI: z.string(),
  ADMIN_LOGOUT_URI: z.string(),

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
