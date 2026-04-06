import z from 'zod';

export const AppConfigurationSchema = z.object({
  // BFF_WEB_SERVICE_PORT: z.coerce.number(),
  // BFF_SELLER_SERVICE_PORT: z.coerce.number(),
  // BFF_ADMIN_SERVICE_PORT: z.coerce.number(),
  CATALOG_SERVICE_PORT: z.coerce.number(),
  ORDER_SERVICE_PORT: z.coerce.number(),
  PROMOTION_SERVICE_PORT: z.coerce.number(),
  PAYMENT_SERVICE_PORT: z.coerce.number(),
  UTILITY_SERVICE_PORT: z.coerce.number(),
});

const configServer = AppConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const AppConfiguration = configServer.data;
