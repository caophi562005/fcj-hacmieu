import z from 'zod';

export const DatabaseConfigurationSchema = z.object({
  CATALOG_SERVICE_DATABASE_URL: z.string().default(''),
  ORDER_SERVICE_DATABASE_URL: z.string().default(''),
  PROMOTION_SERVICE_DATABASE_URL: z.string().default(''),
  PAYMENT_SERVICE_DATABASE_URL: z.string().default(''),
  UTILITY_SERVICE_DATABASE_URL: z.string().default(''),
  IAM_SERVICE_DATABASE_URL: z.string(),
  SHOP_SERVICE_DATABASE_URL: z.string().default(''),
});

const configServer = DatabaseConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const DatabaseConfiguration = configServer.data;
