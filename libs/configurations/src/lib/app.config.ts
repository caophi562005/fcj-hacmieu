import z from 'zod';

export const AppConfigurationSchema = z.object({
  CUSTOMER_BFF_PORT: z.coerce.number(),
  // SELLER_BFF_PORT: z.coerce.number(),
  // ADMIN_BFF_PORT: z.coerce.number(),
  CATALOG_SERVICE_PORT: z.coerce.number(),
  ORDER_SERVICE_PORT: z.coerce.number(),
  PROMOTION_SERVICE_PORT: z.coerce.number(),
  PAYMENT_SERVICE_PORT: z.coerce.number(),
  UTILITY_SERVICE_PORT: z.coerce.number(),
  IAM_SERVICE_PORT: z.coerce.number(),
});

const configServer = AppConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const AppConfiguration = configServer.data;
