import z from 'zod';

export const AppConfigurationSchema = z.object({
  CUSTOMER_BFF_PORT: z.coerce.number().default(3100),
  // SELLER_BFF_PORT: z.coerce.number(),
  ADMIN_BFF_PORT: z.coerce.number().default(3300),
  CATALOG_SERVICE_PORT: z.coerce.number().default(3003),
  ORDER_SERVICE_PORT: z.coerce.number().default(3004),
  PROMOTION_SERVICE_PORT: z.coerce.number().default(3006),
  PAYMENT_SERVICE_PORT: z.coerce.number().default(3005),
  UTILITY_SERVICE_PORT: z.coerce.number().default(3007),
  IAM_SERVICE_PORT: z.coerce.number().default(3001),
  SHOP_SERVICE_PORT: z.coerce.number().default(3002),

  CUSTOMER_BFF_URL: z.string(),
});

const configServer = AppConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const AppConfiguration = configServer.data;
