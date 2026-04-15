import z from 'zod';

export const SqsConfigurationSchema = z.object({
  CREATE_PAYMENT_QUEUE_NAME: z.string(),
  CREATE_PAYMENT_QUEUE_URL: z.string(),

  CREATE_REDEMPTION_QUEUE_NAME: z.string(),
  CREATE_REDEMPTION_QUEUE_URL: z.string(),

  CREATE_ORDER_QUEUE_NAME: z.string(),
  CREATE_ORDER_QUEUE_URL: z.string(),
});

const configServer = SqsConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const SqsConfiguration = configServer.data;
