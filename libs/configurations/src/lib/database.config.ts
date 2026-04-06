import z from 'zod';

export const DatabaseConfigurationSchema = z.object({
  CATALOG_SERVICE_DATABASE_URL: z.string(),
  ORDER_SERVICE_DATABASE_URL: z.string(),
  PROMOTION_SERVICE_DATABASE_URL: z.string(),
  PAYMENT_SERVICE_DATABASE_URL: z.string(),
});

const configServer = DatabaseConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const DatabaseConfiguration = configServer.data;
