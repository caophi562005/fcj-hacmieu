import z from 'zod';

export const KeyConfigurationSchema = z.object({
  PAYMENT_API_KEY: z.string(),
  RESEND_API_KEY: z.string(),
});

const configServer = KeyConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const KeyConfiguration = configServer.data;
