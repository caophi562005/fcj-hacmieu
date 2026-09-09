import z from 'zod';

export const MarketingConfigurationSchema = z.object({
  RESEND_API_KEY: z.string().default(''),
  RESEND_WEBHOOK_SECRET: z.string().default(''),
  MARKETING_FROM_EMAIL: z.string().default('V-Shop <marketing@example.com>'),
  MARKETING_REPLY_TO: z.string().default('support@example.com'),
  MARKETING_ADVERTISER_NAME: z.string().default('V-Shop'),
  MARKETING_ADVERTISER_PHONE: z.string().default(''),
  MARKETING_ADVERTISER_ADDRESS: z.string().default(''),
  MARKETING_UNSUBSCRIBE_SECRET: z
    .string()
    .min(16)
    .default('change-me-in-production'),
  MARKETING_REMINDER_HOURS: z.coerce.number().int().positive().default(24),
});

const configServer = MarketingConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị marketing trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const MarketingConfiguration = configServer.data;
